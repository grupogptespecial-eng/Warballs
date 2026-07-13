package com.geronimo.controlelgwifi

import android.content.Context
import android.util.Base64
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKeys
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import org.json.JSONObject
import java.net.URI
import java.net.URLEncoder
import java.nio.charset.StandardCharsets
import java.security.MessageDigest
import java.security.SecureRandom
import java.security.cert.X509Certificate
import java.util.ArrayDeque
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicInteger
import javax.net.ssl.SSLContext
import javax.net.ssl.TrustManager
import javax.net.ssl.X509TrustManager
import kotlin.math.roundToInt
import kotlin.system.measureNanoTime

enum class TvPlatform(val displayName: String) {
    LgWebOs("LG webOS"),
    SamsungTizenLocal("Samsung Tizen"),
    SamsungSmartThings("Samsung SmartThings"),
    GoogleCast("Google Cast"),
    AndroidTvExperimental("Android / Google TV"),
    DlnaMedia("DLNA / UPnP"),
    FireTvMedia("Fire TV"),
    PhilipsJointSpaceExperimental("Philips JointSpace"),
    HisenseVidaaExperimental("Hisense VIDAA"),
    RokuBlockedByPolicy("Roku"),
    Unknown("Sistema não identificado");

    val defaultSupportLevel: TvSupportLevel
        get() = when (this) {
            LgWebOs -> TvSupportLevel.StableFull
            SamsungTizenLocal -> TvSupportLevel.Experimental
            SamsungSmartThings, GoogleCast, FireTvMedia -> TvSupportLevel.Unsupported
            DlnaMedia -> TvSupportLevel.StableMediaOnly
            RokuBlockedByPolicy -> TvSupportLevel.BlockedByVendorPolicy
            AndroidTvExperimental, PhilipsJointSpaceExperimental, HisenseVidaaExperimental -> TvSupportLevel.Experimental
            Unknown -> TvSupportLevel.Unsupported
        }

    fun defaultCapabilities(
        hasAvTransport: Boolean = false,
        hasRenderingControl: Boolean = false
    ): Set<TvCapability> = when (this) {
        LgWebOs -> TvCapability.lgDefaults
        SamsungTizenLocal -> TvCapability.samsungDefaults
        SamsungSmartThings, GoogleCast, FireTvMedia -> emptySet()
        DlnaMedia -> buildSet {
            add(TvCapability.DeviceInfo)
            if (hasAvTransport) add(TvCapability.Media)
            if (hasRenderingControl) {
                add(TvCapability.Volume)
                add(TvCapability.AbsoluteVolume)
            }
        }.ifEmpty { TvCapability.dlnaMediaDefaults }
        AndroidTvExperimental -> setOf(TvCapability.Media, TvCapability.DeviceInfo)
        PhilipsJointSpaceExperimental, HisenseVidaaExperimental -> setOf(TvCapability.DeviceInfo)
        RokuBlockedByPolicy, Unknown -> emptySet()
    }
}

enum class TvSupportLevel(val displayName: String) {
    StableFull("Controle completo"),
    BetaFull("Controle amplo beta"),
    StableMediaOnly("Controle de mídia"),
    Experimental("Experimental"),
    BlockedByVendorPolicy("Bloqueado pela política do fabricante"),
    Unsupported("Não suportado")
}

data class TvBackendMetadata(
    val platform: TvPlatform,
    val supportLevel: TvSupportLevel,
    val displayName: String,
    val accountRequired: Boolean,
    val localOnly: Boolean,
    val notes: String
)

interface TvBackendListener {
    fun onConnectionState(state: ConnectionState, message: String, reconnectAttempt: Int = 0)
    fun onApps(apps: List<TvApp>)
    fun onInputs(inputs: List<TvInput>)
    fun onVolume(volume: Int?, muted: Boolean)
    fun onCapabilities(capabilities: Set<TvCapability>)
    fun onCommandLatency(milliseconds: Double) = Unit
}

interface TvBackend {
    val metadata: TvBackendMetadata
    val defaultCapabilities: Set<TvCapability>

    fun connect(device: TvDevice, userInitiated: Boolean = true)
    fun close()
    fun forgetDevice(device: TvDevice)
    fun send(action: RemoteAction)

    fun setMute(muted: Boolean) = Unit
    fun movePointer(dx: Int, dy: Int) = Unit
    fun clickPointer() = Unit
    fun scrollPointer(delta: Int) = Unit
    fun launchApp(app: TvApp) = Unit
    fun switchInput(input: TvInput) = Unit
    fun insertText(text: String) = Unit
    fun deleteText() = Unit
    fun sendNumber(number: Int) = Unit
    fun sendColor(color: String) = Unit
    fun refreshDeviceData() = Unit
}

/** Keeps the already tested LG implementation behind the universal API. */
class LgWebOsBackend(
    context: Context,
    private val listener: TvBackendListener
) : TvBackend, FastLgWebOsClient.Listener {
    private val client = FastLgWebOsClient(context, this)

    override val metadata = TvBackendMetadata(
        platform = TvPlatform.LgWebOs,
        supportLevel = TvSupportLevel.StableFull,
        displayName = "LG webOS",
        accountRequired = false,
        localOnly = true,
        notes = "Controle completo pela rede local; ligar depende do modelo e de Wake-on-LAN."
    )
    override val defaultCapabilities: Set<TvCapability> = TvCapability.lgDefaults

    override fun connect(device: TvDevice, userInitiated: Boolean) = client.connect(device, userInitiated)
    override fun close() = client.close()
    override fun forgetDevice(device: TvDevice) = client.forgetDevice(device.ip)
    override fun send(action: RemoteAction) {
        val elapsed = measureNanoTime { client.send(action) } / 1_000_000.0
        listener.onCommandLatency(elapsed)
    }
    override fun setMute(muted: Boolean) = client.setMute(muted)
    override fun movePointer(dx: Int, dy: Int) = client.move(dx, dy)
    override fun clickPointer() = client.click()
    override fun scrollPointer(delta: Int) = client.scroll(delta)
    override fun launchApp(app: TvApp) = client.launchApp(app.id)
    override fun switchInput(input: TvInput) = client.switchInput(input.id)
    override fun insertText(text: String) = client.insertText(text)
    override fun deleteText() = client.deleteText()
    override fun sendNumber(number: Int) = client.sendNumber(number)
    override fun sendColor(color: String) = client.sendColor(color)
    override fun refreshDeviceData() = client.refreshDeviceData()

    override fun onConnectionState(state: ConnectionState, message: String, reconnectAttempt: Int) =
        listener.onConnectionState(state, message, reconnectAttempt)
    override fun onApps(apps: List<TvApp>) = listener.onApps(apps)
    override fun onInputs(inputs: List<TvInput>) = listener.onInputs(inputs)
    override fun onVolume(volume: Int?, muted: Boolean) = listener.onVolume(volume, muted)
    override fun onCapabilities(capabilities: Set<TvCapability>) = listener.onCapabilities(capabilities)
}

/**
 * Experimental local Samsung Tizen remote.
 *
 * The TV normally displays a pairing confirmation. A returned token is stored encrypted and reused.
 * Only the well-known remote-key channel is enabled; undocumented app-management APIs are not used.
 */
class SamsungTizenBackend(
    context: Context,
    private val listener: TvBackendListener
) : TvBackend {
    private val appContext = context.applicationContext
    private val securePreferences = EncryptedSharedPreferences.create(
        "libre_remote_samsung_secure",
        MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC),
        appContext,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val plainClient = OkHttpClient.Builder()
        .connectTimeout(1_250, TimeUnit.MILLISECONDS)
        .readTimeout(0, TimeUnit.MILLISECONDS)
        .pingInterval(12, TimeUnit.SECONDS)
        .retryOnConnectionFailure(true)
        .build()
    private val tlsClient = createTlsClient()
    private val queuedKeys = ArrayDeque<String>(32)
    private val queueLock = Any()
    private val endpointChosen = AtomicBoolean(false)
    private val endpointFailures = AtomicInteger(0)

    @Volatile private var device: TvDevice? = null
    @Volatile private var socket: WebSocket? = null
    @Volatile private var connected = false
    @Volatile private var manuallyClosed = true
    @Volatile private var generation = 0
    @Volatile private var reconnectAttempt = 0
    private var reconnectJob: Job? = null

    override val metadata = TvBackendMetadata(
        platform = TvPlatform.SamsungTizenLocal,
        supportLevel = TvSupportLevel.Experimental,
        displayName = "Samsung Tizen local",
        accountRequired = false,
        localOnly = true,
        notes = "Baixa latência e sem conta, mas o protocolo local varia entre gerações e permanece experimental."
    )
    override val defaultCapabilities: Set<TvCapability> = TvCapability.samsungDefaults

    override fun connect(device: TvDevice, userInitiated: Boolean) {
        if (userInitiated) reconnectAttempt = 0
        this.device = device
        manuallyClosed = false
        connected = false
        reconnectJob?.cancel()
        socket?.cancel()
        socket = null
        endpointChosen.set(false)
        endpointFailures.set(0)
        val currentGeneration = ++generation
        listener.onConnectionState(
            if (reconnectAttempt > 0) ConnectionState.Reconnecting else ConnectionState.Connecting,
            if (reconnectAttempt > 0) "Reconectando à Samsung…" else "Conectando a ${device.displayName}…",
            reconnectAttempt
        )

        val token = securePreferences.getString("token_${device.stableId}", null)
        val preferred = securePreferences.getString("endpoint_${device.stableId}", null)
        val name = Base64.encodeToString("Libre Remote".toByteArray(), Base64.NO_WRAP)
        val encodedName = URLEncoder.encode(name, StandardCharsets.UTF_8.name())
        val secure = buildString {
            append("wss://${device.ip}:8002/api/v2/channels/samsung.remote.control?name=$encodedName")
            if (!token.isNullOrBlank()) append("&token=${URLEncoder.encode(token, StandardCharsets.UTF_8.name())}")
        }
        val plain = "ws://${device.ip}:8001/api/v2/channels/samsung.remote.control?name=$encodedName"
        val endpoints = listOfNotNull(preferred, secure.takeUnless { it == preferred }, plain.takeUnless { it == preferred }).distinct()
        endpoints.forEachIndexed { index, endpoint ->
            scope.launch {
                if (index > 0) delay(110L * index)
                if (!endpointChosen.get() && !manuallyClosed && generation == currentGeneration) {
                    openEndpoint(endpoint, endpoints.size, currentGeneration)
                }
            }
        }
    }

    private fun openEndpoint(endpoint: String, endpointCount: Int, currentGeneration: Int) {
        val client = if (endpoint.startsWith("wss://")) tlsClient else plainClient
        client.newWebSocket(Request.Builder().url(endpoint).build(), object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                if (manuallyClosed || generation != currentGeneration || !endpointChosen.compareAndSet(false, true)) {
                    webSocket.close(1000, "Another endpoint won")
                    return
                }
                if (endpoint.startsWith("wss://") && !verifyOrStoreCertificate(response)) {
                    endpointChosen.set(false)
                    webSocket.close(1008, "Certificate changed")
                    listener.onConnectionState(
                        ConnectionState.Error,
                        "A identidade segura da TV mudou. Remova a TV e pareie novamente."
                    )
                    return
                }
                socket = webSocket
                device?.let { securePreferences.edit().putString("endpoint_${it.stableId}", endpoint).apply() }
                listener.onConnectionState(ConnectionState.Pairing, "Aceite o controle Libre Remote na TV Samsung")
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                if (generation != currentGeneration) return
                val message = runCatching { JSONObject(text) }.getOrNull() ?: return
                when (message.optString("event")) {
                    "ms.channel.connect", "ms.channel.ready" -> {
                        val data = message.optJSONObject("data")
                        val token = data?.optString("token")?.takeIf(String::isNotBlank)
                        val current = device
                        if (token != null && current != null) {
                            securePreferences.edit().putString("token_${current.stableId}", token).apply()
                        }
                        connected = true
                        reconnectJob?.cancel()
                        reconnectAttempt = 0
                        listener.onCapabilities(defaultCapabilities)
                        listener.onApps(emptyList())
                        listener.onInputs(emptyList())
                        listener.onConnectionState(ConnectionState.Connected, "Conectada a ${current?.displayName ?: "Samsung TV"}")
                        flushQueue(webSocket)
                    }
                    "ms.channel.unauthorized" -> {
                        connected = false
                        listener.onConnectionState(ConnectionState.Error, "Pareamento recusado pela TV Samsung")
                    }
                }
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                if (manuallyClosed || generation != currentGeneration) return
                if (webSocket == socket || connected) {
                    scheduleReconnect()
                } else if (endpointFailures.incrementAndGet() >= endpointCount && !endpointChosen.get()) {
                    scheduleReconnect()
                }
            }

            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                if (!manuallyClosed && generation == currentGeneration && webSocket == socket) scheduleReconnect()
            }
        })
    }

    private fun scheduleReconnect() {
        if (manuallyClosed || reconnectJob?.isActive == true) return
        connected = false
        endpointChosen.set(false)
        val waits = longArrayOf(250, 500, 1_000, 2_000, 5_000, 8_000)
        reconnectAttempt = (reconnectAttempt + 1).coerceAtMost(waits.size)
        val wait = waits[(reconnectAttempt - 1).coerceIn(waits.indices)]
        listener.onConnectionState(ConnectionState.Reconnecting, "Reconectando à Samsung…", reconnectAttempt)
        reconnectJob = scope.launch {
            delay(wait)
            device?.let { connect(it, userInitiated = false) }
        }
    }

    override fun send(action: RemoteAction) {
        val key = when (action) {
            RemoteAction.Up -> "KEY_UP"
            RemoteAction.Down -> "KEY_DOWN"
            RemoteAction.Left -> "KEY_LEFT"
            RemoteAction.Right -> "KEY_RIGHT"
            RemoteAction.Enter -> "KEY_ENTER"
            RemoteAction.Back -> "KEY_RETURN"
            RemoteAction.Home -> "KEY_HOME"
            RemoteAction.Menu -> "KEY_MENU"
            RemoteAction.Settings -> "KEY_MENU"
            RemoteAction.Info -> "KEY_INFO"
            RemoteAction.Guide -> "KEY_GUIDE"
            RemoteAction.Exit -> "KEY_EXIT"
            RemoteAction.VolumeUp -> "KEY_VOLUP"
            RemoteAction.VolumeDown -> "KEY_VOLDOWN"
            RemoteAction.Mute -> "KEY_MUTE"
            RemoteAction.ChannelUp -> "KEY_CHUP"
            RemoteAction.ChannelDown -> "KEY_CHDOWN"
            RemoteAction.Play, RemoteAction.PlayPause -> "KEY_PLAY"
            RemoteAction.Pause -> "KEY_PAUSE"
            RemoteAction.Rewind, RemoteAction.Previous -> "KEY_REWIND"
            RemoteAction.FastForward, RemoteAction.Next -> "KEY_FF"
            RemoteAction.Stop -> "KEY_STOP"
            RemoteAction.PowerOff -> "KEY_POWER"
        }
        sendKey(key)
    }

    override fun setMute(muted: Boolean) = sendKey("KEY_MUTE")
    override fun sendNumber(number: Int) = sendKey("KEY_${number.coerceIn(0, 9)}")
    override fun sendColor(color: String) {
        val key = when (color.uppercase()) {
            "RED" -> "KEY_RED"
            "GREEN" -> "KEY_GREEN"
            "YELLOW" -> "KEY_YELLOW"
            "BLUE" -> "KEY_BLUE"
            else -> return
        }
        sendKey(key)
    }

    private fun sendKey(key: String) {
        val message = JSONObject()
            .put("method", "ms.remote.control")
            .put(
                "params",
                JSONObject()
                    .put("Cmd", "Click")
                    .put("DataOfCmd", key)
                    .put("Option", "false")
                    .put("TypeOfRemote", "SendRemoteKey")
            )
            .toString()
        val elapsed = measureNanoTime {
            val sent = connected && socket?.send(message) == true
            if (!sent) {
                synchronized(queueLock) {
                    while (queuedKeys.size >= 32 && queuedKeys.isNotEmpty()) queuedKeys.removeFirst()
                    queuedKeys.addLast(message)
                }
                if (!manuallyClosed && socket == null) device?.let { connect(it, userInitiated = false) }
            }
        } / 1_000_000.0
        listener.onCommandLatency(elapsed)
    }

    private fun flushQueue(webSocket: WebSocket) {
        val messages = mutableListOf<String>()
        synchronized(queueLock) {
            while (queuedKeys.isNotEmpty()) messages += queuedKeys.removeFirst()
        }
        messages.forEach(webSocket::send)
    }

    override fun forgetDevice(device: TvDevice) {
        securePreferences.edit()
            .remove("token_${device.stableId}")
            .remove("endpoint_${device.stableId}")
            .remove("cert_${device.stableId}")
            .apply()
    }

    override fun close() {
        manuallyClosed = true
        reconnectJob?.cancel()
        connected = false
        endpointChosen.set(false)
        synchronized(queueLock) { queuedKeys.clear() }
        socket?.close(1000, "Closing")
        socket = null
    }

    private fun verifyOrStoreCertificate(response: Response): Boolean {
        val current = device ?: return false
        val encoded = response.handshake?.peerCertificates?.firstOrNull()?.encoded ?: return true
        val digest = MessageDigest.getInstance("SHA-256")
            .digest(encoded)
            .joinToString("") { "%02x".format(it) }
        val key = "cert_${current.stableId}"
        val saved = securePreferences.getString(key, null)
        return if (saved == null) {
            securePreferences.edit().putString(key, digest).apply()
            true
        } else saved == digest
    }

    private fun createTlsClient(): OkHttpClient {
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
            .connectTimeout(1_250, TimeUnit.MILLISECONDS)
            .readTimeout(0, TimeUnit.MILLISECONDS)
            .pingInterval(12, TimeUnit.SECONDS)
            .retryOnConnectionFailure(true)
            .build()
    }
}

/** Controls the currently playing media through standard UPnP AVTransport/RenderingControl services. */
class DlnaMediaBackend(
    private val listener: TvBackendListener
) : TvBackend {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val xmlType = "text/xml; charset=utf-8".toMediaType()
    private val client = OkHttpClient.Builder()
        .connectTimeout(1_200, TimeUnit.MILLISECONDS)
        .readTimeout(2_500, TimeUnit.MILLISECONDS)
        .writeTimeout(2_500, TimeUnit.MILLISECONDS)
        .retryOnConnectionFailure(true)
        .build()

    @Volatile private var device: TvDevice? = null
    @Volatile private var connected = false
    @Volatile private var muted = false
    @Volatile private var volume: Int? = null

    override val metadata = TvBackendMetadata(
        platform = TvPlatform.DlnaMedia,
        supportLevel = TvSupportLevel.StableMediaOnly,
        displayName = "DLNA / UPnP",
        accountRequired = false,
        localOnly = true,
        notes = "Controla a reprodução atual e o volume quando a TV expõe AVTransport e RenderingControl."
    )
    override val defaultCapabilities: Set<TvCapability> = TvCapability.dlnaMediaDefaults

    override fun connect(device: TvDevice, userInitiated: Boolean) {
        this.device = device
        val capabilities = device.platform.defaultCapabilities(
            hasAvTransport = device.avTransportUrl != null,
            hasRenderingControl = device.renderingControlUrl != null
        )
        if (device.avTransportUrl == null && device.renderingControlUrl == null) {
            connected = false
            listener.onConnectionState(ConnectionState.Error, "A TV anunciou DLNA, mas não forneceu serviços de controle")
            return
        }
        connected = true
        listener.onCapabilities(capabilities)
        listener.onApps(emptyList())
        listener.onInputs(emptyList())
        listener.onConnectionState(ConnectionState.Connected, "Conectada a ${device.displayName} para mídia")
        refreshDeviceData()
    }

    override fun send(action: RemoteAction) {
        if (!connected) return
        when (action) {
            RemoteAction.Play, RemoteAction.PlayPause -> avTransport("Play", "<Speed>1</Speed>")
            RemoteAction.Pause -> avTransport("Pause")
            RemoteAction.Stop -> avTransport("Stop")
            RemoteAction.VolumeUp -> adjustVolume(2)
            RemoteAction.VolumeDown -> adjustVolume(-2)
            RemoteAction.Mute -> setMute(!muted)
            else -> Unit
        }
    }

    override fun setMute(muted: Boolean) {
        val url = device?.renderingControlUrl ?: return
        scope.launch {
            val elapsed = measureNanoTime {
                soap(
                    url = url,
                    service = "urn:schemas-upnp-org:service:RenderingControl:1",
                    action = "SetMute",
                    inner = "<InstanceID>0</InstanceID><Channel>Master</Channel><DesiredMute>${if (muted) 1 else 0}</DesiredMute>"
                )
            } / 1_000_000.0
            this@DlnaMediaBackend.muted = muted
            listener.onVolume(volume, muted)
            listener.onCommandLatency(elapsed)
        }
    }

    private fun adjustVolume(delta: Int) {
        val url = device?.renderingControlUrl ?: return
        scope.launch {
            val current = volume ?: getVolume(url) ?: 10
            val target = (current + delta).coerceIn(0, 100)
            val elapsed = measureNanoTime {
                soap(
                    url = url,
                    service = "urn:schemas-upnp-org:service:RenderingControl:1",
                    action = "SetVolume",
                    inner = "<InstanceID>0</InstanceID><Channel>Master</Channel><DesiredVolume>$target</DesiredVolume>"
                )
            } / 1_000_000.0
            volume = target
            listener.onVolume(target, muted)
            listener.onCommandLatency(elapsed)
        }
    }

    private fun avTransport(action: String, extra: String = "") {
        val url = device?.avTransportUrl ?: return
        scope.launch {
            val elapsed = measureNanoTime {
                soap(
                    url = url,
                    service = "urn:schemas-upnp-org:service:AVTransport:1",
                    action = action,
                    inner = "<InstanceID>0</InstanceID>$extra"
                )
            } / 1_000_000.0
            listener.onCommandLatency(elapsed)
        }
    }

    override fun refreshDeviceData() {
        val current = device ?: return
        scope.launch {
            val newVolume = current.renderingControlUrl?.let(::getVolume)
            val newMute = current.renderingControlUrl?.let(::getMute)
            if (newVolume != null) volume = newVolume
            if (newMute != null) muted = newMute
            listener.onVolume(volume, muted)
        }
    }

    private fun getVolume(url: String): Int? {
        val body = soap(
            url,
            "urn:schemas-upnp-org:service:RenderingControl:1",
            "GetVolume",
            "<InstanceID>0</InstanceID><Channel>Master</Channel>"
        ) ?: return null
        return Regex("<CurrentVolume>(\\d+)</CurrentVolume>", RegexOption.IGNORE_CASE)
            .find(body)?.groupValues?.getOrNull(1)?.toIntOrNull()?.coerceIn(0, 100)
    }

    private fun getMute(url: String): Boolean? {
        val body = soap(
            url,
            "urn:schemas-upnp-org:service:RenderingControl:1",
            "GetMute",
            "<InstanceID>0</InstanceID><Channel>Master</Channel>"
        ) ?: return null
        return Regex("<CurrentMute>([01]|true|false)</CurrentMute>", RegexOption.IGNORE_CASE)
            .find(body)?.groupValues?.getOrNull(1)?.let { it == "1" || it.equals("true", true) }
    }

    private fun soap(url: String, service: String, action: String, inner: String): String? {
        if (!isLocalUrl(url)) return null
        val envelope = """<?xml version="1.0" encoding="utf-8"?>
            |<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
            |<s:Body><u:$action xmlns:u="$service">$inner</u:$action></s:Body>
            |</s:Envelope>""".trimMargin()
        val request = Request.Builder()
            .url(url)
            .header("SOAPACTION", "\"$service#$action\"")
            .header("Connection", "keep-alive")
            .post(envelope.toRequestBody(xmlType))
            .build()
        return runCatching {
            client.newCall(request).execute().use { response ->
                if (!response.isSuccessful) null else response.body?.string()?.take(250_000)
            }
        }.getOrNull()
    }

    override fun forgetDevice(device: TvDevice) = Unit
    override fun close() {
        connected = false
        device = null
    }

    private fun isLocalUrl(value: String): Boolean = runCatching {
        val host = URI(value).host ?: return@runCatching false
        NetworkAddressValidator.isLocalHost(host)
    }.getOrDefault(false)
}

class UnsupportedTvBackend(
    override val metadata: TvBackendMetadata,
    private val listener: TvBackendListener
) : TvBackend {
    override val defaultCapabilities: Set<TvCapability> = emptySet()
    override fun connect(device: TvDevice, userInitiated: Boolean) {
        listener.onCapabilities(emptySet())
        listener.onConnectionState(ConnectionState.Error, metadata.notes)
    }
    override fun close() = Unit
    override fun forgetDevice(device: TvDevice) = Unit
    override fun send(action: RemoteAction) = Unit
}

class TvBackendRegistry(
    context: Context,
    private val listener: TvBackendListener
) {
    private val lgBackend: TvBackend = LgWebOsBackend(context, listener)
    private val samsungBackend: TvBackend = SamsungTizenBackend(context, listener)
    private val dlnaBackend: TvBackend = DlnaMediaBackend(listener)
    private val unsupported = mutableMapOf<TvPlatform, TvBackend>()

    fun backendFor(platform: TvPlatform): TvBackend = when (platform) {
        TvPlatform.LgWebOs -> lgBackend
        TvPlatform.SamsungTizenLocal -> samsungBackend
        TvPlatform.DlnaMedia -> dlnaBackend
        else -> unsupported.getOrPut(platform) {
            UnsupportedTvBackend(metadataFor(platform), listener)
        }
    }

    fun closeAll() {
        lgBackend.close()
        samsungBackend.close()
        dlnaBackend.close()
        unsupported.values.forEach(TvBackend::close)
    }

    fun availableMetadata(): List<TvBackendMetadata> = TvPlatform.entries.map(::metadataFor)

    private fun metadataFor(platform: TvPlatform): TvBackendMetadata = when (platform) {
        TvPlatform.LgWebOs -> lgBackend.metadata
        TvPlatform.SamsungTizenLocal -> samsungBackend.metadata
        TvPlatform.DlnaMedia -> dlnaBackend.metadata
        TvPlatform.SamsungSmartThings -> TvBackendMetadata(
            platform, TvSupportLevel.Unsupported, platform.displayName,
            accountRequired = true, localOnly = false,
            notes = "SmartThings requer cadastro OAuth e credenciais do aplicativo; o conector ainda não está ativado nesta build."
        )
        TvPlatform.GoogleCast -> TvBackendMetadata(
            platform, TvSupportLevel.Unsupported, platform.displayName,
            accountRequired = false, localOnly = false,
            notes = "O Cast oficial exige configuração de remetente/receptor e ainda não está ativado nesta build."
        )
        TvPlatform.RokuBlockedByPolicy -> TvBackendMetadata(
            platform, TvSupportLevel.BlockedByVendorPolicy, platform.displayName,
            accountRequired = false, localOnly = true,
            notes = "O controle Roku não é ativado no aplicativo público enquanto a política do fabricante restringir apps móveis de terceiros."
        )
        TvPlatform.AndroidTvExperimental -> TvBackendMetadata(
            platform, TvSupportLevel.Experimental, platform.displayName,
            accountRequired = false, localOnly = true,
            notes = "Não existe nesta build uma API pública para controle completo da interface do Android TV."
        )
        TvPlatform.FireTvMedia -> TvBackendMetadata(
            platform, TvSupportLevel.Unsupported, platform.displayName,
            accountRequired = false, localOnly = false,
            notes = "Somente integrações autorizadas serão usadas; o backend Fire TV ainda não está ativado."
        )
        TvPlatform.PhilipsJointSpaceExperimental,
        TvPlatform.HisenseVidaaExperimental -> TvBackendMetadata(
            platform, TvSupportLevel.Experimental, platform.displayName,
            accountRequired = false, localOnly = true,
            notes = "Plataforma detectável, porém o controle permanece desativado até testes físicos e auditoria do protocolo."
        )
        TvPlatform.Unknown -> TvBackendMetadata(
            platform, TvSupportLevel.Unsupported, platform.displayName,
            accountRequired = false, localOnly = true,
            notes = "O sistema desta TV não pôde ser identificado ou não oferece um protocolo compatível."
        )
    }
}

object NetworkAddressValidator {
    fun isLocalHost(host: String): Boolean {
        val normalized = host.removePrefix("[").removeSuffix("]").lowercase()
        if (normalized == "localhost" || normalized.endsWith(".local")) return true
        if (normalized.contains(':')) {
            return normalized == "::1" || normalized.startsWith("fe80:") || normalized.startsWith("fc") || normalized.startsWith("fd")
        }
        val parts = normalized.split('.').mapNotNull(String::toIntOrNull)
        if (parts.size != 4 || parts.any { it !in 0..255 }) return false
        return parts[0] == 10 ||
            (parts[0] == 192 && parts[1] == 168) ||
            (parts[0] == 172 && parts[1] in 16..31) ||
            (parts[0] == 169 && parts[1] == 254) ||
            parts[0] == 127
    }
}
