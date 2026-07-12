package com.geronimo.controlelgwifi

import android.app.Activity
import android.app.AlertDialog
import android.content.Context
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.net.DhcpInfo
import android.net.wifi.WifiManager
import android.os.Bundle
import android.text.InputType
import android.view.Gravity
import android.view.MotionEvent
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.GridLayout
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.Space
import android.widget.TextView
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import org.json.JSONArray
import org.json.JSONObject
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetAddress
import java.net.InetSocketAddress
import java.net.SocketTimeoutException
import java.net.URI
import java.security.SecureRandom
import java.security.cert.X509Certificate
import java.util.Locale
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.ConcurrentLinkedQueue
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicInteger
import javax.net.ssl.SSLContext
import javax.net.ssl.TrustManager
import javax.net.ssl.X509TrustManager
import kotlin.math.abs

class MainActivity : Activity() {
    private lateinit var statusView: TextView
    private lateinit var ipInput: EditText
    private lateinit var macInput: EditText
    private lateinit var textInput: EditText
    private var remote: LgWebOsClient? = null
    private val worker = Executors.newCachedThreadPool()
    private val prefs by lazy { getSharedPreferences("lg_remote", Context.MODE_PRIVATE) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        buildUi()
        ipInput.setText(prefs.getString("last_ip", "") ?: "")
        macInput.setText(prefs.getString("last_mac", "") ?: "")
        val savedIp = ipInput.text.toString().trim()
        if (savedIp.isNotEmpty()) connectToTv(savedIp) else discoverTvs()
    }

    override fun onDestroy() {
        remote?.close()
        worker.shutdownNow()
        super.onDestroy()
    }

    private fun buildUi() {
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(16), dp(16), dp(16), dp(28))
            setBackgroundColor(Color.rgb(14, 16, 20))
        }
        root.addView(label("Controle LG Wi-Fi", 26f, true).apply {
            setTextColor(Color.WHITE)
            gravity = Gravity.CENTER_HORIZONTAL
        })
        root.addView(label("Sem anúncios • conexão direta com a TV", 14f, false).apply {
            setTextColor(Color.rgb(170, 180, 195))
            gravity = Gravity.CENTER_HORIZONTAL
            setPadding(0, 0, 0, dp(12))
        })
        statusView = label("Procurando a TV…", 15f, true).apply {
            setTextColor(Color.rgb(125, 211, 252))
            setPadding(dp(12), dp(10), dp(12), dp(10))
            background = rounded(Color.rgb(28, 34, 44), 14f)
        }
        root.addView(statusView, fullWidth())

        root.addView(section("Conexão"))
        val ipRow = row()
        ipInput = EditText(this).apply {
            hint = "IP da TV, ex.: 192.168.1.20"
            setHintTextColor(Color.GRAY)
            setTextColor(Color.WHITE)
            inputType = InputType.TYPE_CLASS_PHONE
            singleLine = true
            backgroundTintList = android.content.res.ColorStateList.valueOf(Color.rgb(125, 211, 252))
        }
        ipRow.addView(ipInput, weighted(1f))
        ipRow.addView(actionButton("Conectar") { connectToTv(ipInput.text.toString().trim()) })
        root.addView(ipRow, fullWidth())
        val discoveryRow = row()
        discoveryRow.addView(actionButton("Buscar TVs") { discoverTvs() }, weighted(1f))
        discoveryRow.addView(actionButton("Reconectar") { connectToTv(ipInput.text.toString().trim()) }, weighted(1f))
        root.addView(discoveryRow, fullWidth())

        root.addView(section("Navegação"))
        val nav = GridLayout(this).apply {
            columnCount = 3
            alignmentMode = GridLayout.ALIGN_BOUNDS
            useDefaultMargins = true
        }
        nav.addView(Space(this))
        nav.addView(remoteButton("▲") { remote?.button("UP") })
        nav.addView(Space(this))
        nav.addView(remoteButton("◀") { remote?.button("LEFT") })
        nav.addView(remoteButton("OK") { remote?.button("ENTER") })
        nav.addView(remoteButton("▶") { remote?.button("RIGHT") })
        nav.addView(remoteButton("Voltar") { remote?.button("BACK") })
        nav.addView(remoteButton("▼") { remote?.button("DOWN") })
        nav.addView(remoteButton("Home") { remote?.button("HOME") })
        root.addView(nav, fullWidth())

        val systemRow = row()
        systemRow.addView(remoteButton("⚙ Menu") { remote?.button("MENU") }, weighted(1f))
        systemRow.addView(remoteButton("Info") { remote?.button("INFO") }, weighted(1f))
        systemRow.addView(remoteButton("⏻ Desligar") { remote?.powerOff() }, weighted(1f))
        root.addView(systemRow, fullWidth())

        root.addView(section("Volume e canais"))
        val volumeRow = row()
        volumeRow.addView(remoteButton("Vol −") { remote?.volumeDown() }, weighted(1f))
        volumeRow.addView(remoteButton("Mudo") { remote?.toggleMute() }, weighted(1f))
        volumeRow.addView(remoteButton("Vol +") { remote?.volumeUp() }, weighted(1f))
        root.addView(volumeRow, fullWidth())
        val channelRow = row()
        channelRow.addView(remoteButton("Canal −") { remote?.channelDown() }, weighted(1f))
        channelRow.addView(remoteButton("Canal +") { remote?.channelUp() }, weighted(1f))
        root.addView(channelRow, fullWidth())

        root.addView(section("Reprodução"))
        val mediaRow = row()
        mediaRow.addView(remoteButton("⏪") { remote?.rewind() }, weighted(1f))
        mediaRow.addView(remoteButton("▶") { remote?.play() }, weighted(1f))
        mediaRow.addView(remoteButton("⏸") { remote?.pause() }, weighted(1f))
        mediaRow.addView(remoteButton("⏩") { remote?.fastForward() }, weighted(1f))
        root.addView(mediaRow, fullWidth())

        root.addView(section("Touchpad"))
        val touchPad = TextView(this).apply {
            text = "Deslize para mover o cursor\nToque para clicar"
            textSize = 16f
            gravity = Gravity.CENTER
            setTextColor(Color.rgb(210, 220, 230))
            background = rounded(Color.rgb(28, 34, 44), 18f)
            setPadding(dp(12), dp(42), dp(12), dp(42))
        }
        var lastX = 0f
        var lastY = 0f
        var downX = 0f
        var downY = 0f
        var lastMoveAt = 0L
        touchPad.setOnTouchListener { _, event ->
            when (event.actionMasked) {
                MotionEvent.ACTION_DOWN -> {
                    lastX = event.x
                    lastY = event.y
                    downX = event.x
                    downY = event.y
                    true
                }
                MotionEvent.ACTION_MOVE -> {
                    val now = System.currentTimeMillis()
                    if (now - lastMoveAt >= 18) {
                        val dx = ((event.x - lastX) * 1.7f).toInt()
                        val dy = ((event.y - lastY) * 1.7f).toInt()
                        if (dx != 0 || dy != 0) remote?.move(dx, dy)
                        lastX = event.x
                        lastY = event.y
                        lastMoveAt = now
                    }
                    true
                }
                MotionEvent.ACTION_UP -> {
                    if (abs(event.x - downX) < dp(10).toFloat() && abs(event.y - downY) < dp(10).toFloat()) remote?.click()
                    true
                }
                else -> true
            }
        }
        root.addView(touchPad, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(160)).apply { topMargin = dp(6) })

        root.addView(section("Entradas"))
        val inputRow = row()
        inputRow.addView(remoteButton("HDMI 1") { remote?.switchInput("HDMI_1") }, weighted(1f))
        inputRow.addView(remoteButton("HDMI 2") { remote?.switchInput("HDMI_2") }, weighted(1f))
        inputRow.addView(remoteButton("HDMI 3") { remote?.switchInput("HDMI_3") }, weighted(1f))
        root.addView(inputRow, fullWidth())

        root.addView(section("Aplicativos"))
        val appRow1 = row()
        appRow1.addView(remoteButton("Netflix") { remote?.launchByTitle("Netflix", "netflix") }, weighted(1f))
        appRow1.addView(remoteButton("YouTube") { remote?.launchByTitle("YouTube", "youtube.leanback.v4") }, weighted(1f))
        root.addView(appRow1, fullWidth())
        val appRow2 = row()
        appRow2.addView(remoteButton("Prime Video") { remote?.launchByTitle("Prime", "amazon") }, weighted(1f))
        appRow2.addView(remoteButton("Disney+") { remote?.launchByTitle("Disney", "com.disney.disneyplus-prod") }, weighted(1f))
        root.addView(appRow2, fullWidth())

        root.addView(section("Digitar na TV"))
        val textRow = row()
        textInput = EditText(this).apply {
            hint = "Texto"
            setHintTextColor(Color.GRAY)
            setTextColor(Color.WHITE)
            singleLine = true
            backgroundTintList = android.content.res.ColorStateList.valueOf(Color.rgb(125, 211, 252))
        }
        textRow.addView(textInput, weighted(1f))
        textRow.addView(actionButton("Enviar") {
            val text = textInput.text.toString()
            if (text.isNotEmpty()) remote?.insertText(text)
        })
        root.addView(textRow, fullWidth())

        root.addView(section("Ligar a TV"))
        root.addView(label("Para ligar pelo Wi-Fi, ative “TV ligada com dispositivo móvel”/“Mobile TV On” nas configurações da LG e informe o MAC da TV uma vez.", 13f, false).apply { setTextColor(Color.rgb(170, 180, 195)) })
        val wolRow = row()
        macInput = EditText(this).apply {
            hint = "MAC, ex.: AA:BB:CC:DD:EE:FF"
            setHintTextColor(Color.GRAY)
            setTextColor(Color.WHITE)
            singleLine = true
            backgroundTintList = android.content.res.ColorStateList.valueOf(Color.rgb(125, 211, 252))
        }
        wolRow.addView(macInput, weighted(1f))
        wolRow.addView(actionButton("Ligar") {
            val mac = macInput.text.toString().trim()
            prefs.edit().putString("last_mac", mac).apply()
            worker.execute {
                val ok = WakeOnLan.send(this, mac)
                runOnUiThread { setStatus(if (ok) "Sinal de ligar enviado. Aguarde alguns segundos." else "MAC inválido. Use o formato AA:BB:CC:DD:EE:FF.") }
            }
        })
        root.addView(wolRow, fullWidth())

        setContentView(ScrollView(this).apply { addView(root) })
    }

    private fun discoverTvs() {
        setStatus("Procurando TVs LG na rede…")
        worker.execute {
            val found = SsdpDiscovery.discover(this)
            runOnUiThread {
                when {
                    found.isEmpty() -> setStatus("Nenhuma TV encontrada automaticamente. Digite o IP da TV e toque em Conectar.")
                    found.size == 1 -> {
                        ipInput.setText(found.first().ip)
                        setStatus("TV encontrada: ${found.first().name}")
                        connectToTv(found.first().ip)
                    }
                    else -> AlertDialog.Builder(this)
                        .setTitle("Escolha a TV")
                        .setItems(found.map { "${it.name} — ${it.ip}" }.toTypedArray()) { _, index ->
                            ipInput.setText(found[index].ip)
                            connectToTv(found[index].ip)
                        }
                        .setNegativeButton("Cancelar", null)
                        .show()
                }
            }
        }
    }

    private fun connectToTv(rawIp: String) {
        val ip = rawIp.trim().removePrefix("http://").removePrefix("https://").substringBefore('/').substringBefore(':')
        if (!isLikelyLocalAddress(ip)) {
            setStatus("Digite um IP local válido, como 192.168.1.20.")
            return
        }
        ipInput.setText(ip)
        prefs.edit().putString("last_ip", ip).apply()
        remote?.close()
        setStatus("Conectando a $ip…")
        remote = LgWebOsClient(ip, prefs) { message -> runOnUiThread { setStatus(message) } }.also { it.connect() }
    }

    private fun isLikelyLocalAddress(value: String): Boolean {
        val parts = value.split('.')
        if (parts.size != 4) return value.equals("lgwebostv", true)
        val nums = parts.mapNotNull { it.toIntOrNull()?.takeIf { n -> n in 0..255 } }
        if (nums.size != 4) return false
        return nums[0] == 10 || (nums[0] == 192 && nums[1] == 168) || (nums[0] == 172 && nums[1] in 16..31) || (nums[0] == 169 && nums[1] == 254)
    }

    private fun setStatus(message: String) { statusView.text = message }
    private fun label(text: String, size: Float, bold: Boolean) = TextView(this).apply {
        this.text = text
        textSize = size
        if (bold) setTypeface(typeface, android.graphics.Typeface.BOLD)
    }
    private fun section(text: String) = label(text, 17f, true).apply {
        setTextColor(Color.WHITE)
        setPadding(0, dp(20), 0, dp(6))
    }
    private fun row() = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL }
    private fun actionButton(text: String, onClick: () -> Unit) = Button(this).apply {
        this.text = text
        isAllCaps = false
        setTextColor(Color.WHITE)
        backgroundTintList = android.content.res.ColorStateList.valueOf(Color.rgb(30, 112, 160))
        setOnClickListener { onClick() }
    }
    private fun remoteButton(text: String, onClick: () -> Unit) = Button(this).apply {
        this.text = text
        isAllCaps = false
        minHeight = dp(48)
        setTextColor(Color.WHITE)
        backgroundTintList = android.content.res.ColorStateList.valueOf(Color.rgb(38, 45, 58))
        setOnClickListener { onClick() }
    }
    private fun fullWidth() = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
    private fun weighted(weight: Float) = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, weight).apply { marginStart = dp(2); marginEnd = dp(2) }
    private fun rounded(color: Int, radiusDp: Float) = GradientDrawable().apply { setColor(color); cornerRadius = dp(radiusDp.toInt()).toFloat() }
    private fun dp(value: Int): Int = (value * resources.displayMetrics.density).toInt()
}

data class TvDevice(val ip: String, val name: String)

object SsdpDiscovery {
    fun discover(context: Context): List<TvDevice> {
        val results = linkedMapOf<String, TvDevice>()
        val wifi = context.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
        val lock = wifi.createMulticastLock("controle-lg-discovery").apply { setReferenceCounted(false) }
        try {
            lock.acquire()
            DatagramSocket(null).use { socket ->
                socket.reuseAddress = true
                socket.broadcast = true
                socket.bind(InetSocketAddress(0))
                socket.soTimeout = 650
                val address = InetAddress.getByName("239.255.255.250")
                listOf("urn:lge-com:service:webos-second-screen:1", "urn:schemas-upnp-org:device:MediaRenderer:1", "ssdp:all").forEach { st ->
                    val request = ("M-SEARCH * HTTP/1.1\r\nHOST: 239.255.255.250:1900\r\nMAN: \"ssdp:discover\"\r\nMX: 2\r\nST: $st\r\n\r\n").toByteArray(Charsets.UTF_8)
                    socket.send(DatagramPacket(request, request.size, address, 1900))
                }
                val deadline = System.currentTimeMillis() + 4500
                val buffer = ByteArray(8192)
                while (System.currentTimeMillis() < deadline) {
                    try {
                        val packet = DatagramPacket(buffer, buffer.size)
                        socket.receive(packet)
                        val response = String(packet.data, 0, packet.length, Charsets.UTF_8)
                        val lower = response.lowercase(Locale.ROOT)
                        if (!(lower.contains("webos") || lower.contains("lge") || lower.contains("lg smart") || lower.contains("lg electronics"))) continue
                        val location = response.lineSequence().firstOrNull { it.startsWith("LOCATION:", true) }?.substringAfter(':')?.trim()
                        val host = runCatching { location?.let { URI(it).host } }.getOrNull() ?: packet.address.hostAddress ?: continue
                        val server = response.lineSequence().firstOrNull { it.startsWith("SERVER:", true) }?.substringAfter(':')?.trim()
                        results[host] = TvDevice(host, server?.take(42) ?: "LG webOS TV")
                    } catch (_: SocketTimeoutException) { }
                }
            }
        } catch (_: Exception) { 
        } finally {
            if (lock.isHeld) lock.release()
        }
        return results.values.toList()
    }
}

class LgWebOsClient(
    private val ip: String,
    private val prefs: android.content.SharedPreferences,
    private val onStatus: (String) -> Unit
) {
    private val clearClient = OkHttpClient.Builder().connectTimeout(5, TimeUnit.SECONDS).readTimeout(0, TimeUnit.MILLISECONDS).pingInterval(20, TimeUnit.SECONDS).build()
    private val secureClient = insecureTlsClient()
    private var mainSocket: WebSocket? = null
    private var pointerSocket: WebSocket? = null
    private var mainReady = false
    private var pointerReady = false
    private var closed = false
    private var attempt = 0
    private val ids = AtomicInteger(1)
    private val pending = ConcurrentHashMap<String, (JSONObject) -> Unit>()
    private val pointerQueue = ConcurrentLinkedQueue<String>()

    fun connect() { closed = false; attempt = 0; connectEndpoint() }

    private fun connectEndpoint() {
        if (closed) return
        val url = if (attempt == 0) "ws://$ip:3000" else "wss://$ip:3001"
        onStatus("Conectando à TV por ${if (attempt == 0) "Wi-Fi" else "Wi-Fi seguro"}…")
        val client = if (url.startsWith("wss")) secureClient else clearClient
        client.newWebSocket(Request.Builder().url(url).build(), object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                mainSocket = webSocket
                sendRegistration()
                onStatus("Conectado. Aceite o pedido de pareamento que aparecer na TV.")
            }
            override fun onMessage(webSocket: WebSocket, text: String) { handleMessage(text) }
            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                if (closed) return
                if (!mainReady && attempt == 0) { attempt = 1; connectEndpoint() }
                else onStatus("Não foi possível conectar. Confira o IP e se a TV permite controle por aplicativo.")
            }
            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                if (!closed) onStatus("Conexão encerrada. Toque em Reconectar.")
            }
        })
    }

    private fun sendRegistration() {
        val payload = JSONObject().put("pairingType", "PROMPT").put("manifest", registrationManifest())
        prefs.getString("client_key_$ip", null)?.let { payload.put("client-key", it) }
        mainSocket?.send(JSONObject().put("id", "register_0").put("type", "register").put("payload", payload).toString())
    }

    private fun handleMessage(text: String) {
        val message = runCatching { JSONObject(text) }.getOrNull() ?: return
        val type = message.optString("type")
        val payload = message.optJSONObject("payload") ?: JSONObject()
        if (type == "registered" || payload.has("client-key")) {
            payload.optString("client-key").takeIf { it.isNotBlank() }?.let { prefs.edit().putString("client_key_$ip", it).apply() }
            mainReady = true
            onStatus("TV pareada e pronta para usar.")
            ensurePointer()
        }
        val id = message.optString("id")
        if (id.isNotBlank()) pending.remove(id)?.invoke(payload)
        if (type == "error") onStatus("TV respondeu: ${message.optString("error", payload.optString("errorText", "Comando não aceito"))}")
    }

    private fun request(uri: String, payload: JSONObject = JSONObject(), callback: ((JSONObject) -> Unit)? = null) {
        if (!mainReady) { onStatus("Aguarde o pareamento com a TV."); return }
        val id = "req_${ids.getAndIncrement()}"
        callback?.let { pending[id] = it }
        val message = JSONObject().put("id", id).put("type", "request").put("uri", uri).put("payload", payload)
        if (mainSocket?.send(message.toString()) != true) {
            pending.remove(id)
            onStatus("A conexão caiu. Toque em Reconectar.")
        }
    }

    private fun ensurePointer(afterReady: (() -> Unit)? = null) {
        if (pointerReady) { afterReady?.invoke(); return }
        request("ssap://com.webos.service.networkinput/getPointerInputSocket", callback = { payload ->
            val path = payload.optString("socketPath")
            if (path.isBlank()) { onStatus("A TV não liberou o controle direcional."); return@request }
            val client = if (path.startsWith("wss")) secureClient else clearClient
            client.newWebSocket(Request.Builder().url(path).build(), object : WebSocketListener() {
                override fun onOpen(webSocket: WebSocket, response: Response) {
                    pointerSocket = webSocket
                    pointerReady = true
                    while (true) webSocket.send(pointerQueue.poll() ?: break)
                    afterReady?.invoke()
                }
                override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) { pointerReady = false; onStatus("Falha no touchpad; os demais botões ainda podem funcionar.") }
                override fun onClosed(webSocket: WebSocket, code: Int, reason: String) { pointerReady = false }
            })
        })
    }

    private fun sendPointer(message: String) {
        if (pointerReady && pointerSocket?.send(message) == true) return
        pointerQueue.add(message)
        ensurePointer()
    }

    fun button(name: String) = sendPointer("type:button\nname:$name\n\n")
    fun move(dx: Int, dy: Int) = sendPointer("type:move\ndx:$dx\ndy:$dy\ndown:0\n\n")
    fun click() = sendPointer("type:click\n\n")
    fun volumeUp() = request("ssap://audio/volumeUp")
    fun volumeDown() = request("ssap://audio/volumeDown")
    fun channelUp() = request("ssap://tv/channelUp")
    fun channelDown() = request("ssap://tv/channelDown")
    fun powerOff() = request("ssap://system/turnOff")
    fun play() = request("ssap://media.controls/play")
    fun pause() = request("ssap://media.controls/pause")
    fun rewind() = request("ssap://media.controls/rewind")
    fun fastForward() = request("ssap://media.controls/fastForward")

    fun toggleMute() {
        request("ssap://audio/getStatus", callback = { status ->
            val muted = status.optBoolean("mute", status.optBoolean("muted", false))
            request("ssap://audio/setMute", JSONObject().put("mute", !muted))
        })
    }
    fun switchInput(inputId: String) = request("ssap://tv/switchInput", JSONObject().put("inputId", inputId))
    fun insertText(text: String) = request("ssap://com.webos.service.ime/insertText", JSONObject().put("text", text).put("replace", 0))

    fun launchByTitle(titleQuery: String, fallbackId: String) {
        request("ssap://com.webos.applicationManager/listApps", callback = { payload ->
            val apps = payload.optJSONArray("apps") ?: JSONArray()
            var selected: String? = null
            for (i in 0 until apps.length()) {
                val app = apps.optJSONObject(i) ?: continue
                if (app.optString("title", app.optString("name")).contains(titleQuery, ignoreCase = true)) { selected = app.optString("id"); break }
            }
            request("ssap://system.launcher/launch", JSONObject().put("id", selected?.takeIf { it.isNotBlank() } ?: fallbackId))
        })
    }

    fun close() {
        closed = true
        mainReady = false
        pointerReady = false
        pending.clear()
        pointerQueue.clear()
        pointerSocket?.close(1000, "closing")
        mainSocket?.close(1000, "closing")
        pointerSocket = null
        mainSocket = null
    }

    private fun registrationManifest(): JSONObject {
        val signedPermissions = arrayOf("TEST_SECURE", "CONTROL_INPUT_TEXT", "CONTROL_MOUSE_AND_KEYBOARD", "READ_INSTALLED_APPS", "READ_LGE_SDX", "READ_NOTIFICATIONS", "SEARCH", "WRITE_SETTINGS", "WRITE_NOTIFICATION_ALERT", "CONTROL_POWER", "READ_CURRENT_CHANNEL", "READ_RUNNING_APPS", "READ_UPDATE_INFO", "UPDATE_FROM_REMOTE_APP", "READ_LGE_TV_INPUT_EVENTS", "READ_TV_CURRENT_TIME")
        val permissions = arrayOf("LAUNCH", "LAUNCH_WEBAPP", "APP_TO_APP", "CLOSE", "TEST_OPEN", "TEST_PROTECTED", "CONTROL_AUDIO", "CONTROL_DISPLAY", "CONTROL_INPUT_JOYSTICK", "CONTROL_INPUT_MEDIA_RECORDING", "CONTROL_INPUT_MEDIA_PLAYBACK", "CONTROL_INPUT_TV", "CONTROL_POWER", "READ_APP_STATUS", "READ_CURRENT_CHANNEL", "READ_INPUT_DEVICE_LIST", "READ_NETWORK_STATE", "READ_RUNNING_APPS", "READ_TV_CHANNEL_LIST", "WRITE_NOTIFICATION_TOAST", "READ_POWER_STATE", "READ_COUNTRY_INFO", "READ_SETTINGS", "CONTROL_TV_SCREEN", "CONTROL_TV_STANBY", "CONTROL_FAVORITE_GROUP", "CONTROL_USER_INFO", "CHECK_BLUETOOTH_DEVICE", "CONTROL_BLUETOOTH", "CONTROL_TIMER_INFO", "CONTROL_RECORDING", "READ_RECORDING_STATE", "READ_RECORDING_LIST", "READ_TV_PROGRAM_INFO", "CONTROL_BOX_CHANNEL", "READ_TV_CONTENT_STATE", "READ_TV_CURRENT_TIME", "CONTROL_TV_POWER", "CONTROL_WOL")
        val signed = JSONObject()
            .put("created", "20140509")
            .put("appId", "com.lge.test")
            .put("vendorId", "com.lge")
            .put("localizedAppNames", JSONObject().put("", "LG Remote App").put("ko-KR", "리모컨 앱").put("zxx-XX", "ЛГ Rэмotэ AПП"))
            .put("localizedVendorNames", JSONObject().put("", "LG Electronics"))
            .put("permissions", JSONArray().apply { signedPermissions.forEach { put(it) } })
            .put("serial", "2f930e2d2cfe083771f68e4fe7bb07")
        val signature = "eyJhbGdvcml0aG0iOiJSU0EtU0hBMjU2Iiwia2V5SWQiOiJ0ZXN0LXNpZ25pbmctY2VydCIsInNpZ25hdHVyZVZlcnNpb24iOjF9.hrVRgjCwXVvE2OOSpDZ58hR+59aFNwYDyjQgKk3auukd7pcegmE2CzPCa0bJ0ZsRAcKkCTJrWo5iDzNhMBWRyaMOv5zWSrthlf7G128qvIlpMT0YNY+n/FaOHE73uLrS/g7swl3/qH/BGFG2Hu4RlL48eb3lLKqTt2xKHdCs6Cd4RMfJPYnzgvI4BNrFUKsjkcu+WD4OO2A27Pq1n50cMchmcaXadJhGrOqH5YmHdOCj5NSHzJYrsW0HPlpuAx/ECMeIZYDh6RMqaFM2DXzdKX9NmmyqzJ3o/0lkk/N97gfVRLW5hA29yeAwaCViZNCP8iC9aO0q9fQojoa7NQnAtw=="
        return JSONObject()
            .put("manifestVersion", 1)
            .put("appVersion", "1.1")
            .put("signed", signed)
            .put("permissions", JSONArray().apply { permissions.forEach { put(it) } })
            .put("signatures", JSONArray().put(JSONObject().put("signatureVersion", 1).put("signature", signature)))
    }

    private fun insecureTlsClient(): OkHttpClient {
        val trustManager = object : X509TrustManager {
            override fun getAcceptedIssuers(): Array<X509Certificate> = emptyArray()
            override fun checkClientTrusted(chain: Array<out X509Certificate>?, authType: String?) = Unit
            override fun checkServerTrusted(chain: Array<out X509Certificate>?, authType: String?) = Unit
        }
        val sslContext = SSLContext.getInstance("TLS")
        sslContext.init(null, arrayOf<TrustManager>(trustManager), SecureRandom())
        return OkHttpClient.Builder()
            .sslSocketFactory(sslContext.socketFactory, trustManager)
            .hostnameVerifier { _, _ -> true }
            .connectTimeout(5, TimeUnit.SECONDS)
            .readTimeout(0, TimeUnit.MILLISECONDS)
            .pingInterval(20, TimeUnit.SECONDS)
            .build()
    }
}

object WakeOnLan {
    fun send(context: Context, macText: String): Boolean {
        val clean = macText.replace("-", "").replace(":", "").replace(".", "")
        if (!clean.matches(Regex("[0-9A-Fa-f]{12}"))) return false
        val mac = ByteArray(6) { index -> clean.substring(index * 2, index * 2 + 2).toInt(16).toByte() }
        val packetBytes = ByteArray(6 + 16 * mac.size)
        for (i in 0 until 6) packetBytes[i] = 0xFF.toByte()
        for (i in 6 until packetBytes.size step mac.size) System.arraycopy(mac, 0, packetBytes, i, mac.size)
        return try {
            DatagramSocket().use { socket ->
                socket.broadcast = true
                val destinations = linkedSetOf(InetAddress.getByName("255.255.255.255"))
                directedBroadcast(context)?.let { destinations.add(it) }
                destinations.forEach { destination ->
                    socket.send(DatagramPacket(packetBytes, packetBytes.size, destination, 9))
                    socket.send(DatagramPacket(packetBytes, packetBytes.size, destination, 7))
                }
            }
            true
        } catch (_: Exception) { false }
    }

    private fun directedBroadcast(context: Context): InetAddress? = runCatching {
        val wifi = context.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
        val dhcp: DhcpInfo = wifi.dhcpInfo ?: return null
        val broadcast = (dhcp.ipAddress and dhcp.netmask) or dhcp.netmask.inv()
        InetAddress.getByAddress(ByteArray(4) { index -> ((broadcast shr (index * 8)) and 0xFF).toByte() })
    }.getOrNull()
}
