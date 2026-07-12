package com.geronimo.controlelgwifi

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKeys
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import org.json.JSONArray
import org.json.JSONObject
import java.security.MessageDigest
import java.security.SecureRandom
import java.security.cert.X509Certificate
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.ConcurrentLinkedQueue
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicInteger
import javax.net.ssl.SSLContext
import javax.net.ssl.TrustManager
import javax.net.ssl.X509TrustManager

class LgWebOsClient(
    context: Context,
    private val listener: Listener
) {
    interface Listener {
        fun onConnectionState(state: ConnectionState, message: String)
        fun onApps(apps: List<TvApp>)
        fun onInputs(inputs: List<TvInput>)
        fun onVolume(volume: Int?, muted: Boolean)
    }

    private data class Motion(val dx: Int, val dy: Int)

    private val appContext = context.applicationContext
    private val securePreferences = createSecurePreferences(appContext)
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val requestIds = AtomicInteger(1)
    private val callbacks = ConcurrentHashMap<String, (JSONObject) -> Unit>()
    private val pointerQueue = ConcurrentLinkedQueue<String>()
    private val motionChannel = Channel<Motion>(Channel.CONFLATED)

    private val plainClient = OkHttpClient.Builder()
        .connectTimeout(1_600, TimeUnit.MILLISECONDS)
        .readTimeout(0, TimeUnit.MILLISECONDS)
        .pingInterval(15, TimeUnit.SECONDS)
        .retryOnConnectionFailure(true)
        .build()

    private val tlsClient = createLocalTlsClient()

    private var device: TvDevice? = null
    private var mainSocket: WebSocket? = null
    private var pointerSocket: WebSocket? = null
    private var registered = false
    private var pointerReady = false
    private var closed = true
    private val endpointChosen = AtomicBoolean(false)
    private val endpointFailures = AtomicInteger(0)

    init {
        scope.launch {
            for (motion in motionChannel) {
                sendPointerNow("type:move\ndx:${motion.dx}\ndy:${motion.dy}\ndown:0\n\n")
                delay(12)
            }
        }
    }

    fun connect(device: TvDevice) {
        closeSockets()
        this.device = device
        closed = false
        registered = false
        pointerReady = false
        endpointChosen.set(false)
        endpointFailures.set(0)
        listener.onConnectionState(ConnectionState.Connecting, "Conectando a ${device.name}…")

        val preferred = securePreferences.getString("endpoint_${device.ip}", null)
        val endpoints = listOfNotNull(
            preferred,
            "ws://${device.ip}:3000".takeUnless { it == preferred },
            "wss://${device.ip}:3001".takeUnless { it == preferred }
        ).distinct()

        endpoints.forEachIndexed { index, endpoint ->
            scope.launch {
                if (index > 0 && preferred != null) delay(350)
                if (!endpointChosen.get() && !closed) openEndpoint(endpoint, endpoints.size)
            }
        }
    }

    private fun openEndpoint(endpoint: String, endpointCount: Int) {
        val client = if (endpoint.startsWith("wss://")) tlsClient else plainClient
        client.newWebSocket(Request.Builder().url(endpoint).build(), object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                if (closed || !endpointChosen.compareAndSet(false, true)) {
                    webSocket.close(1000, "Another endpoint connected first")
                    return
                }

                if (endpoint.startsWith("wss://") && !verifyOrStoreCertificate(response)) {
                    endpointChosen.set(false)
                    webSocket.close(1008, "TV certificate changed")
                    listener.onConnectionState(ConnectionState.Error, "O certificado da TV mudou. Remova a TV e pareie novamente.")
                    return
                }

                mainSocket = webSocket
                device?.let { securePreferences.edit().putString("endpoint_${it.ip}", endpoint).apply() }
                listener.onConnectionState(ConnectionState.Pairing, "Conectado. Autorize o pareamento na tela da TV.")
                sendRegistration(webSocket)
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                handleMessage(text)
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                if (closed) return
                if (endpointFailures.incrementAndGet() >= endpointCount && !endpointChosen.get()) {
                    listener.onConnectionState(ConnectionState.Error, "Não foi possível conectar. Confira o IP e as permissões de controle móvel na TV.")
                }
            }

            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                if (!closed && webSocket == mainSocket) {
                    registered = false
                    pointerReady = false
                    listener.onConnectionState(ConnectionState.Error, "A conexão foi encerrada. Toque em reconectar.")
                }
            }
        })
    }

    private fun verifyOrStoreCertificate(response: Response): Boolean {
        val ip = device?.ip ?: return false
        val certificate = response.handshake?.peerCertificates?.firstOrNull()?.encoded ?: return true
        val digest = MessageDigest.getInstance("SHA-256").digest(certificate)
            .joinToString("") { "%02x".format(it) }
        val saved = securePreferences.getString("cert_$ip", null)
        return if (saved == null) {
            securePreferences.edit().putString("cert_$ip", digest).apply()
            true
        } else saved == digest
    }

    private fun sendRegistration(socket: WebSocket) {
        val ip = device?.ip ?: return
        val payload = JSONObject()
            .put("pairingType", "PROMPT")
            .put("manifest", registrationManifest())
        securePreferences.getString("client_key_$ip", null)?.let { payload.put("client-key", it) }
        socket.send(
            JSONObject()
                .put("id", "register_0")
                .put("type", "register")
                .put("payload", payload)
                .toString()
        )
    }

    private fun handleMessage(raw: String) {
        val message = runCatching { JSONObject(raw) }.getOrNull() ?: return
        val payload = message.optJSONObject("payload") ?: JSONObject()
        val type = message.optString("type")

        if (type == "registered" || payload.has("client-key")) {
            val ip = device?.ip ?: return
            payload.optString("client-key")
                .takeIf { it.isNotBlank() }
                ?.let { securePreferences.edit().putString("client_key_$ip", it).apply() }
            registered = true
            listener.onConnectionState(ConnectionState.Connected, "Conectado a ${device?.name ?: "LG webOS TV"}")
            ensurePointerSocket()
            refreshDeviceData()
        }

        val id = message.optString("id")
        if (id.isNotBlank()) callbacks.remove(id)?.invoke(payload)

        if (type == "error") {
            val error = message.optString("error", payload.optString("errorText", "Comando não suportado pela TV"))
            if (error.contains("register", ignoreCase = true)) {
                listener.onConnectionState(ConnectionState.Error, "A TV recusou o pareamento. Revise a opção de conexão móvel.")
            }
        }
    }

    fun send(action: RemoteAction) {
        when (action) {
            RemoteAction.Up -> button("UP")
            RemoteAction.Down -> button("DOWN")
            RemoteAction.Left -> button("LEFT")
            RemoteAction.Right -> button("RIGHT")
            RemoteAction.Enter -> button("ENTER")
            RemoteAction.Back -> button("BACK")
            RemoteAction.Home -> button("HOME")
            RemoteAction.Menu -> button("MENU")
            RemoteAction.Info -> button("INFO")
            RemoteAction.VolumeUp -> request("ssap://audio/volumeUp")
            RemoteAction.VolumeDown -> request("ssap://audio/volumeDown")
            RemoteAction.Mute -> toggleMute()
            RemoteAction.ChannelUp -> request("ssap://tv/channelUp")
            RemoteAction.ChannelDown -> request("ssap://tv/channelDown")
            RemoteAction.Play -> request("ssap://media.controls/play")
            RemoteAction.Pause -> request("ssap://media.controls/pause")
            RemoteAction.Rewind -> request("ssap://media.controls/rewind")
            RemoteAction.FastForward -> request("ssap://media.controls/fastForward")
            RemoteAction.Stop -> request("ssap://media.controls/stop")
            RemoteAction.PowerOff -> request("ssap://system/turnOff")
        }
    }

    fun move(dx: Int, dy: Int) {
        if (dx != 0 || dy != 0) motionChannel.trySend(Motion(dx, dy))
    }

    fun click() = sendPointer("type:click\n\n")

    fun scroll(delta: Int) = sendPointer("type:scroll\ndx:0\ndy:$delta\n\n")

    fun launchApp(appId: String) {
        request("ssap://system.launcher/launch", JSONObject().put("id", appId))
    }

    fun switchInput(inputId: String) {
        request("ssap://tv/switchInput", JSONObject().put("inputId", inputId))
    }

    fun insertText(text: String) {
        request(
            "ssap://com.webos.service.ime/insertText",
            JSONObject().put("text", text).put("replace", 0)
        )
    }

    fun deleteText() {
        request("ssap://com.webos.service.ime/deleteCharacters", JSONObject().put("count", 1))
    }

    fun sendNumber(number: Int) = button(number.coerceIn(0, 9).toString())

    fun sendColor(color: String) = button(color.uppercase())

    fun refreshDeviceData() {
        if (!registered) return
        loadApps()
        loadInputs()
        loadVolume()
    }

    private fun loadApps() {
        request("ssap://com.webos.applicationManager/listApps", callback = { payload ->
            val array = payload.optJSONArray("apps") ?: JSONArray()
            val apps = buildList {
                for (index in 0 until array.length()) {
                    val app = array.optJSONObject(index) ?: continue
                    val id = app.optString("id")
                    val title = app.optString("title", app.optString("name"))
                    if (id.isNotBlank() && title.isNotBlank() && !title.startsWith("com.webos.app.")) {
                        add(TvApp(id, title))
                    }
                }
            }.distinctBy { it.id }.sortedBy { it.title.lowercase() }
            listener.onApps(apps)
        })
    }

    private fun loadInputs() {
        request("ssap://tv/getExternalInputList", callback = { payload ->
            val array = payload.optJSONArray("devices") ?: JSONArray()
            val inputs = buildList {
                for (index in 0 until array.length()) {
                    val input = array.optJSONObject(index) ?: continue
                    val id = input.optString("id")
                    if (id.isNotBlank()) {
                        add(
                            TvInput(
                                id = id,
                                label = input.optString("label", id.replace('_', ' ')),
                                connected = input.optBoolean("connected", true)
                            )
                        )
                    }
                }
            }
            listener.onInputs(inputs)
        })
    }

    private fun loadVolume() {
        request("ssap://audio/getStatus", callback = { payload ->
            val volume = when {
                payload.has("volume") -> payload.optInt("volume")
                payload.optJSONObject("volumeStatus")?.has("volume") == true -> payload.optJSONObject("volumeStatus")?.optInt("volume")
                else -> null
            }
            val muted = payload.optBoolean("mute", payload.optBoolean("muted", false))
            listener.onVolume(volume, muted)
        })
    }

    private fun toggleMute() {
        request("ssap://audio/getStatus", callback = { payload ->
            val muted = payload.optBoolean("mute", payload.optBoolean("muted", false))
            request("ssap://audio/setMute", JSONObject().put("mute", !muted))
            listener.onVolume(null, !muted)
        })
    }

    private fun button(name: String) = sendPointer("type:button\nname:$name\n\n")

    private fun sendPointer(message: String) {
        if (pointerReady && pointerSocket?.send(message) == true) return
        pointerQueue.offer(message)
        ensurePointerSocket()
    }

    private fun sendPointerNow(message: String) {
        if (pointerReady) pointerSocket?.send(message)
    }

    private fun ensurePointerSocket() {
        if (!registered || pointerReady || pointerSocket != null) return
        request("ssap://com.webos.service.networkinput/getPointerInputSocket", callback = { payload ->
            val path = payload.optString("socketPath")
            if (path.isBlank()) return@request
            val client = if (path.startsWith("wss://")) tlsClient else plainClient
            client.newWebSocket(Request.Builder().url(path).build(), object : WebSocketListener() {
                override fun onOpen(webSocket: WebSocket, response: Response) {
                    pointerSocket = webSocket
                    pointerReady = true
                    while (true) {
                        val queued = pointerQueue.poll() ?: break
                        webSocket.send(queued)
                    }
                }

                override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                    pointerReady = false
                    pointerSocket = null
                }

                override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                    pointerReady = false
                    pointerSocket = null
                }
            })
        })
    }

    private fun request(
        uri: String,
        payload: JSONObject = JSONObject(),
        callback: ((JSONObject) -> Unit)? = null
    ) {
        if (!registered) return
        val id = "req_${requestIds.getAndIncrement()}"
        callback?.let { callbacks[id] = it }
        val message = JSONObject()
            .put("id", id)
            .put("type", "request")
            .put("uri", uri)
            .put("payload", payload)
        if (mainSocket?.send(message.toString()) != true) callbacks.remove(id)
    }

    fun forgetDevice(ip: String) {
        securePreferences.edit()
            .remove("client_key_$ip")
            .remove("endpoint_$ip")
            .remove("cert_$ip")
            .apply()
    }

    fun close() {
        closed = true
        closeSockets()
        listener.onConnectionState(ConnectionState.Idle, "Desconectado")
    }

    private fun closeSockets() {
        registered = false
        pointerReady = false
        callbacks.clear()
        pointerQueue.clear()
        pointerSocket?.close(1000, "Closing")
        mainSocket?.close(1000, "Closing")
        pointerSocket = null
        mainSocket = null
    }

    private fun createSecurePreferences(context: Context) = EncryptedSharedPreferences.create(
        "libre_remote_secure",
        MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC),
        context,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    private fun createLocalTlsClient(): OkHttpClient {
        val trustManager = object : X509TrustManager {
            override fun getAcceptedIssuers(): Array<X509Certificate> = emptyArray()
            override fun checkClientTrusted(chain: Array<out X509Certificate>?, authType: String?) = Unit
            override fun checkServerTrusted(chain: Array<out X509Certificate>?, authType: String?) = Unit
        }
        val sslContext = SSLContext.getInstance("TLS")
        sslContext.init(null, arrayOf<TrustManager>(trustManager), SecureRandom())
        return OkHttpClient.Builder()
            .sslSocketFactory(sslContext.socketFactory, trustManager)
            .hostnameVerifier { hostname, _ -> hostname == device?.ip }
            .connectTimeout(1_600, TimeUnit.MILLISECONDS)
            .readTimeout(0, TimeUnit.MILLISECONDS)
            .pingInterval(15, TimeUnit.SECONDS)
            .retryOnConnectionFailure(true)
            .build()
    }

    private fun registrationManifest(): JSONObject {
        val signedPermissions = arrayOf(
            "TEST_SECURE", "CONTROL_INPUT_TEXT", "CONTROL_MOUSE_AND_KEYBOARD",
            "READ_INSTALLED_APPS", "READ_LGE_SDX", "READ_NOTIFICATIONS", "SEARCH",
            "WRITE_SETTINGS", "WRITE_NOTIFICATION_ALERT", "CONTROL_POWER",
            "READ_CURRENT_CHANNEL", "READ_RUNNING_APPS", "READ_UPDATE_INFO",
            "UPDATE_FROM_REMOTE_APP", "READ_LGE_TV_INPUT_EVENTS", "READ_TV_CURRENT_TIME"
        )
        val permissions = arrayOf(
            "LAUNCH", "LAUNCH_WEBAPP", "APP_TO_APP", "CLOSE", "TEST_OPEN", "TEST_PROTECTED",
            "CONTROL_AUDIO", "CONTROL_DISPLAY", "CONTROL_INPUT_JOYSTICK",
            "CONTROL_INPUT_MEDIA_RECORDING", "CONTROL_INPUT_MEDIA_PLAYBACK", "CONTROL_INPUT_TV",
            "CONTROL_POWER", "READ_APP_STATUS", "READ_CURRENT_CHANNEL", "READ_INPUT_DEVICE_LIST",
            "READ_NETWORK_STATE", "READ_RUNNING_APPS", "READ_TV_CHANNEL_LIST",
            "WRITE_NOTIFICATION_TOAST", "READ_POWER_STATE", "READ_COUNTRY_INFO", "READ_SETTINGS",
            "CONTROL_TV_SCREEN", "CONTROL_TV_STANBY", "CONTROL_FAVORITE_GROUP", "CONTROL_USER_INFO",
            "CHECK_BLUETOOTH_DEVICE", "CONTROL_BLUETOOTH", "CONTROL_TIMER_INFO", "CONTROL_RECORDING",
            "READ_RECORDING_STATE", "READ_RECORDING_LIST", "READ_TV_PROGRAM_INFO", "CONTROL_BOX_CHANNEL",
            "READ_TV_CONTENT_STATE", "READ_TV_CURRENT_TIME", "CONTROL_TV_POWER", "CONTROL_WOL"
        )
        val signed = JSONObject()
            .put("created", "20140509")
            .put("appId", "com.lge.test")
            .put("vendorId", "com.lge")
            .put("localizedAppNames", JSONObject().put("", "Libre Remote").put("ko-KR", "Libre Remote"))
            .put("localizedVendorNames", JSONObject().put("", "Libre Remote Community"))
            .put("permissions", JSONArray().apply { signedPermissions.forEach(::put) })
            .put("serial", "2f930e2d2cfe083771f68e4fe7bb07")

        val signature = "eyJhbGdvcml0aG0iOiJSU0EtU0hBMjU2Iiwia2V5SWQiOiJ0ZXN0LXNpZ25pbmctY2VydCIsInNpZ25hdHVyZVZlcnNpb24iOjF9.hrVRgjCwXVvE2OOSpDZ58hR+59aFNwYDyjQgKk3auukd7pcegmE2CzPCa0bJ0ZsRAcKkCTJrWo5iDzNhMBWRyaMOv5zWSrthlf7G128qvIlpMT0YNY+n/FaOHE73uLrS/g7swl3/qH/BGFG2Hu4RlL48eb3lLKqTt2xKHdCs6Cd4RMfJPYnzgvI4BNrFUKsjkcu+WD4OO2A27Pq1n50cMchmcaXadJhGrOqH5YmHdOCj5NSHzJYrsW0HPlpuAx/ECMeIZYDh6RMqaFM2DXzdKX9NmmyqzJ3o/0lkk/N97gfVRLW5hA29yeAwaCViZNCP8iC9aO0q9fQojoa7NQnAtw=="

        return JSONObject()
            .put("manifestVersion", 1)
            .put("appVersion", "0.2.0")
            .put("signed", signed)
            .put("permissions", JSONArray().apply { permissions.forEach(::put) })
            .put("signatures", JSONArray().put(JSONObject().put("signatureVersion", 1).put("signature", signature)))
    }
}
