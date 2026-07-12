package com.geronimo.controlelgwifi

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKeys
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
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
import java.util.ArrayDeque
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicInteger
import javax.net.ssl.SSLContext
import javax.net.ssl.TrustManager
import javax.net.ssl.X509TrustManager

class FastLgWebOsClient(
    context: Context,
    private val listener: Listener
) {
    interface Listener {
        fun onConnectionState(state: ConnectionState, message: String, reconnectAttempt: Int = 0)
        fun onApps(apps: List<TvApp>)
        fun onInputs(inputs: List<TvInput>)
        fun onVolume(volume: Int?, muted: Boolean)
        fun onCapabilities(capabilities: Set<TvCapability>)
    }

    private data class Motion(val dx: Int, val dy: Int)
    private data class CallbackEntry(val callback: (JSONObject) -> Unit, val timeout: Job)

    private val appContext = context.applicationContext
    private val securePreferences = createSecurePreferences(appContext)
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val requestIds = AtomicInteger(1)
    private val callbacks = ConcurrentHashMap<String, CallbackEntry>()
    private val motionChannel = Channel<Motion>(Channel.CONFLATED)
    private val pointerQueue = ArrayDeque<String>(24)
    private val pointerLock = Any()

    private val plainClient = OkHttpClient.Builder()
        .connectTimeout(1_250, TimeUnit.MILLISECONDS)
        .readTimeout(0, TimeUnit.MILLISECONDS)
        .pingInterval(12, TimeUnit.SECONDS)
        .retryOnConnectionFailure(true)
        .build()

    private val tlsClient = createLocalTlsClient()

    @Volatile private var device: TvDevice? = null
    @Volatile private var mainSocket: WebSocket? = null
    @Volatile private var pointerSocket: WebSocket? = null
    @Volatile private var registered = false
    @Volatile private var pointerReady = false
    @Volatile private var manuallyClosed = true
    @Volatile private var reconnectAttempt = 0
    @Volatile private var connectionGeneration = 0
    private val endpointChosen = AtomicBoolean(false)
    private val endpointFailures = AtomicInteger(0)
    private var reconnectJob: Job? = null
    private var pointerOpening = AtomicBoolean(false)
    private var cachedCapabilities = TvCapability.lgDefaults.toMutableSet()

    init {
        scope.launch {
            for (motion in motionChannel) {
                sendPointerNow("type:move\ndx:${motion.dx}\ndy:${motion.dy}\ndown:0\n\n")
                delay(14)
            }
        }
    }

    fun connect(device: TvDevice, userInitiated: Boolean = true) {
        if (userInitiated) reconnectAttempt = 0
        manuallyClosed = false
        reconnectJob?.cancel()
        this.device = device
        val generation = ++connectionGeneration
        closeSockets(notify = false)
        registered = false
        pointerReady = false
        pointerOpening.set(false)
        endpointChosen.set(false)
        endpointFailures.set(0)
        listener.onConnectionState(
            if (reconnectAttempt > 0) ConnectionState.Reconnecting else ConnectionState.Connecting,
            if (reconnectAttempt > 0) "Reconectando à TV…" else "Conectando a ${device.displayName}…",
            reconnectAttempt
        )

        val preferred = securePreferences.getString("endpoint_${device.ip}", null)
        val endpoints = listOfNotNull(
            preferred,
            "ws://${device.ip}:3000".takeUnless { it == preferred },
            "wss://${device.ip}:3001".takeUnless { it == preferred }
        ).distinct()

        endpoints.forEachIndexed { index, endpoint ->
            scope.launch {
                if (index > 0) delay(if (preferred == null) index * 90L else index * 160L)
                if (!endpointChosen.get() && !manuallyClosed && generation == connectionGeneration) {
                    openEndpoint(endpoint, endpoints.size, generation)
                }
            }
        }
    }

    private fun openEndpoint(endpoint: String, endpointCount: Int, generation: Int) {
        val client = if (endpoint.startsWith("wss://")) tlsClient else plainClient
        client.newWebSocket(Request.Builder().url(endpoint).build(), object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                if (
                    manuallyClosed || generation != connectionGeneration ||
                    !endpointChosen.compareAndSet(false, true)
                ) {
                    webSocket.close(1000, "Another endpoint won")
                    return
                }
                if (endpoint.startsWith("wss://") && !verifyOrStoreCertificate(response)) {
                    endpointChosen.set(false)
                    webSocket.close(1008, "Certificate changed")
                    listener.onConnectionState(
                        ConnectionState.Error,
                        "A identidade segura da TV mudou. Esqueça a TV e pareie novamente."
                    )
                    return
                }
                mainSocket = webSocket
                device?.let { securePreferences.edit().putString("endpoint_${it.ip}", endpoint).apply() }
                listener.onConnectionState(ConnectionState.Pairing, "Confirme o pareamento que apareceu na TV")
                sendRegistration(webSocket)
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                if (generation == connectionGeneration) handleMessage(text)
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                if (manuallyClosed || generation != connectionGeneration) return
                if (webSocket == mainSocket && registered) {
                    scheduleReconnect()
                } else if (endpointFailures.incrementAndGet() >= endpointCount && !endpointChosen.get()) {
                    scheduleReconnect(initialFailure = true)
                }
            }

            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                if (!manuallyClosed && generation == connectionGeneration && webSocket == mainSocket) {
                    scheduleReconnect()
                }
            }
        })
    }

    private fun scheduleReconnect(initialFailure: Boolean = false) {
        if (manuallyClosed || reconnectJob?.isActive == true) return
        registered = false
        pointerReady = false
        val delays = longArrayOf(250, 500, 1_000, 2_000, 5_000, 8_000)
        val nextAttempt = (reconnectAttempt + 1).coerceAtMost(delays.size)
        reconnectAttempt = nextAttempt
        val wait = delays[(nextAttempt - 1).coerceIn(delays.indices)]
        listener.onConnectionState(
            ConnectionState.Reconnecting,
            if (initialFailure && nextAttempt >= 3) "TV não respondeu. Tentando novamente…" else "Reconectando…",
            nextAttempt
        )
        reconnectJob = scope.launch {
            delay(wait)
            device?.let { connect(it, userInitiated = false) }
        }
    }

    private fun verifyOrStoreCertificate(response: Response): Boolean {
        val ip = device?.ip ?: return false
        val encoded = response.handshake?.peerCertificates?.firstOrNull()?.encoded ?: return true
        val digest = MessageDigest.getInstance("SHA-256")
            .digest(encoded)
            .joinToString("") { "%02x".format(it) }
        val saved = securePreferences.getString("cert_$ip", null)
        return if (saved == null) {
            securePreferences.edit().putString("cert_$ip", digest).apply()
            true
        } else {
            saved == digest
        }
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
                .takeIf(String::isNotBlank)
                ?.let { securePreferences.edit().putString("client_key_$ip", it).apply() }
            registered = true
            reconnectAttempt = 0
            listener.onConnectionState(ConnectionState.Connected, "Conectada a ${device?.displayName ?: "LG webOS TV"}")
            listener.onCapabilities(cachedCapabilities)
            ensurePointerSocket()
            scope.launch {
                loadVolume()
                delay(90)
                loadInputs()
                delay(140)
                loadApps()
            }
        }

        val id = message.optString("id")
        if (id.isNotBlank()) {
            callbacks.remove(id)?.let { entry ->
                entry.timeout.cancel()
                entry.callback(payload)
            }
        }

        if (type == "error") {
            val error = message.optString("error", payload.optString("errorText", "Comando não suportado"))
            if (error.contains("register", ignoreCase = true) || error.contains("denied", ignoreCase = true)) {
                listener.onConnectionState(ConnectionState.Error, "A TV recusou o pareamento. Autorize conexões móveis nas configurações da TV.")
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
            RemoteAction.Settings -> button("SETTINGS")
            RemoteAction.Info -> button("INFO")
            RemoteAction.Guide -> button("GUIDE")
            RemoteAction.Exit -> button("EXIT")
            RemoteAction.VolumeUp -> request("ssap://audio/volumeUp")
            RemoteAction.VolumeDown -> request("ssap://audio/volumeDown")
            RemoteAction.Mute -> toggleMute()
            RemoteAction.ChannelUp -> request("ssap://tv/channelUp")
            RemoteAction.ChannelDown -> request("ssap://tv/channelDown")
            RemoteAction.Play -> request("ssap://media.controls/play")
            RemoteAction.Pause -> request("ssap://media.controls/pause")
            RemoteAction.PlayPause -> request("ssap://media.controls/play")
            RemoteAction.Rewind -> request("ssap://media.controls/rewind")
            RemoteAction.FastForward -> request("ssap://media.controls/fastForward")
            RemoteAction.Stop -> request("ssap://media.controls/stop")
            RemoteAction.Previous -> button("PREVIOUS")
            RemoteAction.Next -> button("NEXT")
            RemoteAction.PowerOff -> request("ssap://system/turnOff")
        }
    }

    fun setMute(muted: Boolean) {
        listener.onVolume(null, muted)
        request("ssap://audio/setMute", JSONObject().put("mute", muted))
    }

    private fun toggleMute() {
        loadVolume { _, muted -> setMute(!muted) }
    }

    fun move(dx: Int, dy: Int) {
        if (dx != 0 || dy != 0) motionChannel.trySend(Motion(dx.coerceIn(-240, 240), dy.coerceIn(-240, 240)))
    }

    fun click() = sendPointer("type:click\n\n", critical = true)
    fun scroll(delta: Int) = sendPointer("type:scroll\ndx:0\ndy:${delta.coerceIn(-80, 80)}\n\n")
    fun launchApp(appId: String) = request("ssap://system.launcher/launch", JSONObject().put("id", appId))
    fun switchInput(inputId: String) = request("ssap://tv/switchInput", JSONObject().put("inputId", inputId))

    fun insertText(text: String) {
        if (text.isBlank()) return
        request(
            "ssap://com.webos.service.ime/insertText",
            JSONObject().put("text", text.take(500)).put("replace", 0)
        )
    }

    fun deleteText() = request(
        "ssap://com.webos.service.ime/deleteCharacters",
        JSONObject().put("count", 1)
    )

    fun sendNumber(number: Int) = button(number.coerceIn(0, 9).toString())
    fun sendColor(color: String) = button(color.uppercase())

    fun refreshDeviceData() {
        if (!registered) return
        loadVolume()
        loadInputs()
        loadApps()
    }

    private fun loadApps() {
        request("ssap://com.webos.applicationManager/listApps", timeoutMs = 6_000, callback = { payload ->
            val array = payload.optJSONArray("apps") ?: JSONArray()
            val apps = buildList {
                for (index in 0 until array.length()) {
                    val app = array.optJSONObject(index) ?: continue
                    val id = app.optString("id")
                    val title = app.optString("title", app.optString("name"))
                    if (id.isNotBlank() && title.isNotBlank() && !title.startsWith("com.webos.app.")) {
                        add(TvApp(id = id, title = title, iconUrl = app.optString("icon").takeIf(String::isNotBlank)))
                    }
                }
            }.distinctBy(TvApp::id).sortedBy { it.title.lowercase() }
            if (apps.isNotEmpty()) cachedCapabilities += TvCapability.Apps
            listener.onApps(apps)
            listener.onCapabilities(cachedCapabilities)
        })
    }

    private fun loadInputs() {
        request("ssap://tv/getExternalInputList", timeoutMs = 5_000, callback = { payload ->
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
            if (inputs.isNotEmpty()) cachedCapabilities += TvCapability.Inputs
            listener.onInputs(inputs)
            listener.onCapabilities(cachedCapabilities)
        })
    }

    private fun loadVolume(callback: ((Int?, Boolean) -> Unit)? = null) {
        request("ssap://audio/getStatus", timeoutMs = 3_000, callback = { payload ->
            val nested = payload.optJSONObject("volumeStatus")
            val volume = when {
                payload.has("volume") -> payload.optInt("volume")
                nested?.has("volume") == true -> nested.optInt("volume")
                else -> null
            }
            val muted = payload.optBoolean("mute", payload.optBoolean("muted", nested?.optBoolean("mute", false) ?: false))
            listener.onVolume(volume, muted)
            callback?.invoke(volume, muted)
        })
    }

    private fun button(name: String) = sendPointer("type:button\nname:$name\n\n", critical = true)

    private fun sendPointer(message: String, critical: Boolean = false) {
        if (pointerReady && pointerSocket?.send(message) == true) return
        synchronized(pointerLock) {
            if (critical) {
                while (pointerQueue.size >= 24) pointerQueue.removeFirstOrNull()
                pointerQueue.addLast(message)
            } else {
                if (pointerQueue.size < 24) pointerQueue.addLast(message)
            }
        }
        ensurePointerSocket()
    }

    private fun sendPointerNow(message: String) {
        if (pointerReady) pointerSocket?.send(message)
    }

    private fun ensurePointerSocket() {
        if (!registered || pointerReady || !pointerOpening.compareAndSet(false, true)) return
        request("ssap://com.webos.service.networkinput/getPointerInputSocket", timeoutMs = 4_000, callback = { payload ->
            val path = payload.optString("socketPath")
            if (path.isBlank()) {
                pointerOpening.set(false)
                cachedCapabilities -= TvCapability.Pointer
                listener.onCapabilities(cachedCapabilities)
                return@request
            }
            val client = if (path.startsWith("wss://")) tlsClient else plainClient
            client.newWebSocket(Request.Builder().url(path).build(), object : WebSocketListener() {
                override fun onOpen(webSocket: WebSocket, response: Response) {
                    pointerSocket = webSocket
                    pointerReady = true
                    pointerOpening.set(false)
                    cachedCapabilities += TvCapability.Pointer
                    listener.onCapabilities(cachedCapabilities)
                    val queued = mutableListOf<String>()
                    synchronized(pointerLock) {
                        while (pointerQueue.isNotEmpty()) queued += pointerQueue.removeFirst()
                    }
                    queued.forEach(webSocket::send)
                }

                override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                    pointerReady = false
                    pointerSocket = null
                    pointerOpening.set(false)
                }

                override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                    pointerReady = false
                    pointerSocket = null
                    pointerOpening.set(false)
                }
            })
        })
    }

    private fun request(
        uri: String,
        payload: JSONObject = JSONObject(),
        timeoutMs: Long = 4_000,
        callback: ((JSONObject) -> Unit)? = null
    ) {
        if (!registered) return
        val id = "req_${requestIds.getAndIncrement()}"
        if (callback != null) {
            val timeout = scope.launch {
                delay(timeoutMs)
                callbacks.remove(id)
            }
            callbacks[id] = CallbackEntry(callback, timeout)
        }
        val message = JSONObject()
            .put("id", id)
            .put("type", "request")
            .put("uri", uri)
            .put("payload", payload)
        if (mainSocket?.send(message.toString()) != true) {
            callbacks.remove(id)?.timeout?.cancel()
            scheduleReconnect()
        }
    }

    fun forgetDevice(ip: String) {
        securePreferences.edit()
            .remove("client_key_$ip")
            .remove("endpoint_$ip")
            .remove("cert_$ip")
            .apply()
    }

    fun close() {
        manuallyClosed = true
        reconnectJob?.cancel()
        closeSockets(notify = true)
    }

    private fun closeSockets(notify: Boolean) {
        registered = false
        pointerReady = false
        pointerOpening.set(false)
        callbacks.values.forEach { it.timeout.cancel() }
        callbacks.clear()
        synchronized(pointerLock) { pointerQueue.clear() }
        pointerSocket?.close(1000, "Closing")
        mainSocket?.close(1000, "Closing")
        pointerSocket = null
        mainSocket = null
        if (notify) listener.onConnectionState(ConnectionState.Idle, "Desconectada")
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
            .hostnameVerifier { hostname, _ -> hostname == device?.ip || hostname.equals("lgwebostv", true) }
            .connectTimeout(1_250, TimeUnit.MILLISECONDS)
            .readTimeout(0, TimeUnit.MILLISECONDS)
            .pingInterval(12, TimeUnit.SECONDS)
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
            .put("localizedAppNames", JSONObject().put("", "Libre Remote"))
            .put("localizedVendorNames", JSONObject().put("", "Libre Remote Community"))
            .put("permissions", JSONArray().apply { signedPermissions.forEach(::put) })
            .put("serial", "2f930e2d2cfe083771f68e4fe7bb07")
        val signature = "eyJhbGdvcml0aG0iOiJSU0EtU0hBMjU2Iiwia2V5SWQiOiJ0ZXN0LXNpZ25pbmctY2VydCIsInNpZ25hdHVyZVZlcnNpb24iOjF9.hrVRgjCwXVvE2OOSpDZ58hR+59aFNwYDyjQgKk3auukd7pcegmE2CzPCa0bJ0ZsRAcKkCTJrWo5iDzNhMBWRyaMOv5zWSrthlf7G128qvIlpMT0YNY+n/FaOHE73uLrS/g7swl3/qH/BGFG2Hu4RlL48eb3lLKqTt2xKHdCs6Cd4RMfJPYnzgvI4BNrFUKsjkcu+WD4OO2A27Pq1n50cMchmcaXadJhGrOqH5YmHdOCj5NSHzJYrsW0HPlpuAx/ECMeIZYDh6RMqaFM2DXzdKX9NmmyqzJ3o/0lkk/N97gfVRLW5hA29yeAwaCViZNCP8iC9aO0q9fQojoa7NQnAtw=="
        return JSONObject()
            .put("manifestVersion", 1)
            .put("appVersion", "1.0.0")
            .put("signed", signed)
            .put("permissions", JSONArray().apply { permissions.forEach(::put) })
            .put("signatures", JSONArray().put(JSONObject().put("signatureVersion", 1).put("signature", signature)))
    }
}
