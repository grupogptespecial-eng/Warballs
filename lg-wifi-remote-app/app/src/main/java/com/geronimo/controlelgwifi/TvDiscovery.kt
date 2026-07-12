package com.geronimo.controlelgwifi

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.wifi.WifiManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.withContext
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.HttpURLConnection
import java.net.InetAddress
import java.net.InetSocketAddress
import java.net.Socket
import java.net.SocketTimeoutException
import java.net.URI
import java.net.URL
import java.util.Locale

object TvDiscovery {
    private val searchTargets = listOf(
        "urn:lge-com:service:webos-second-screen:1",
        "urn:schemas-upnp-org:device:MediaRenderer:1",
        "ssdp:all"
    )

    suspend fun discover(
        context: Context,
        knownDevices: List<TvDevice> = emptyList(),
        durationMs: Long = 2_700
    ): List<TvDevice> = coroutineScope {
        val ssdp = async(Dispatchers.IO) { discoverSsdp(context, durationMs) }
        val known = knownDevices.map { device ->
            async(Dispatchers.IO) { device.takeIf { isTvReachable(it.ip, 420) } }
        }
        val hostname = async(Dispatchers.IO) {
            runCatching {
                InetAddress.getByName("lgwebostv").hostAddress
                    ?.takeIf { isTvReachable(it, 420) }
                    ?.let { TvDevice(ip = it, name = "LG webOS TV") }
            }.getOrNull()
        }

        val all = buildList {
            addAll(ssdp.await())
            addAll(known.awaitAll().filterNotNull())
            hostname.await()?.let(::add)
        }
        all.groupBy(TvDevice::ip).map { (_, variants) ->
            val discovered = variants.firstOrNull { it.name != "LG webOS TV" } ?: variants.first()
            val saved = knownDevices.firstOrNull { it.ip == discovered.ip }
            discovered.copy(
                room = saved?.room.orEmpty(),
                mac = saved?.mac,
                capabilities = saved?.capabilities ?: discovered.capabilities,
                lastSeenAt = System.currentTimeMillis()
            )
        }.sortedWith(compareByDescending<TvDevice> { knownDevices.any { saved -> saved.ip == it.ip } }.thenBy { it.displayName })
    }

    suspend fun diagnose(context: Context, device: TvDevice?): NetworkDiagnostic = withContext(Dispatchers.IO) {
        val connectivity = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val active = connectivity.activeNetwork
        val caps = active?.let(connectivity::getNetworkCapabilities)
        val wifiConnected = caps?.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) == true ||
            caps?.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET) == true
        val localAddress = runCatching {
            val wifi = context.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
            val raw = wifi.connectionInfo.ipAddress
            if (raw == 0) null else listOf(0, 8, 16, 24).joinToString(".") { shift -> ((raw shr shift) and 0xFF).toString() }
        }.getOrNull()
        val target = device?.ip
        val port3000 = target?.let { canConnect(it, 3000, 650) }
        val port3001 = target?.let { canConnect(it, 3001, 650) }
        val reachable = when {
            target == null -> null
            port3000 == true || port3001 == true -> true
            else -> false
        }
        val summary = when {
            !wifiConnected -> "O celular não está conectado a uma rede Wi-Fi ou Ethernet."
            target == null -> "Rede pronta. Selecione uma TV para testar a conexão."
            reachable == true -> "A TV respondeu na rede local."
            else -> "A TV não respondeu. Verifique se está ligada e se o roteador não isola dispositivos."
        }
        NetworkDiagnostic(
            wifiConnected = wifiConnected,
            multicastAvailable = null,
            localAddress = localAddress,
            tvReachable = reachable,
            port3000Reachable = port3000,
            port3001Reachable = port3001,
            summary = summary
        )
    }

    fun isTvReachable(ip: String, timeoutMs: Int = 500): Boolean =
        canConnect(ip, 3000, timeoutMs) || canConnect(ip, 3001, timeoutMs)

    private fun discoverSsdp(context: Context, durationMs: Long): List<TvDevice> {
        val devices = linkedMapOf<String, TvDevice>()
        val wifi = context.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
        val multicastLock = wifi.createMulticastLock("libre-remote-discovery").apply { setReferenceCounted(false) }
        try {
            multicastLock.acquire()
            DatagramSocket(null).use { socket ->
                socket.reuseAddress = true
                socket.broadcast = true
                socket.soTimeout = 260
                socket.bind(InetSocketAddress(0))
                val multicastAddress = InetAddress.getByName("239.255.255.250")
                repeat(2) { round ->
                    searchTargets.forEach { target ->
                        val request = buildString {
                            append("M-SEARCH * HTTP/1.1\r\n")
                            append("HOST: 239.255.255.250:1900\r\n")
                            append("MAN: \"ssdp:discover\"\r\n")
                            append("MX: 1\r\n")
                            append("ST: $target\r\n\r\n")
                        }.toByteArray(Charsets.UTF_8)
                        socket.send(DatagramPacket(request, request.size, multicastAddress, 1900))
                    }
                    if (round == 0) Thread.sleep(80)
                }
                val deadline = System.currentTimeMillis() + durationMs
                val buffer = ByteArray(12_288)
                while (System.currentTimeMillis() < deadline) {
                    try {
                        val packet = DatagramPacket(buffer, buffer.size)
                        socket.receive(packet)
                        val response = String(packet.data, 0, packet.length, Charsets.UTF_8)
                        val lower = response.lowercase(Locale.ROOT)
                        if (!looksLikeLgTv(lower)) continue
                        val headers = parseHeaders(response)
                        val location = headers["location"]
                        val ip = runCatching { location?.let { URI(it).host } }.getOrNull()
                            ?: packet.address.hostAddress
                            ?: continue
                        val details = location?.let(::fetchDescription)
                        val name = details?.first
                            ?: headers["dlna.devicename.lge.com"]
                            ?: headers["server"]?.takeIf { it.contains("LG", true) }
                            ?: "LG webOS TV"
                        devices[ip] = TvDevice(ip = ip, name = cleanName(name), model = details?.second)
                    } catch (_: SocketTimeoutException) {
                        // Keep collecting until the deadline.
                    }
                }
            }
        } catch (_: Exception) {
            // Known-device probing and manual IP remain available.
        } finally {
            if (multicastLock.isHeld) multicastLock.release()
        }
        return devices.values.toList()
    }

    private fun parseHeaders(response: String): Map<String, String> = response.lineSequence()
        .mapNotNull { line ->
            val index = line.indexOf(':')
            if (index <= 0) null else line.substring(0, index).trim().lowercase() to line.substring(index + 1).trim()
        }
        .toMap()

    private fun fetchDescription(location: String): Pair<String, String?>? = runCatching {
        val connection = URL(location).openConnection() as HttpURLConnection
        connection.connectTimeout = 550
        connection.readTimeout = 550
        connection.instanceFollowRedirects = false
        connection.inputStream.bufferedReader().use { reader ->
            val xml = reader.readText().take(160_000)
            val friendly = Regex("<friendlyName>(.*?)</friendlyName>", RegexOption.IGNORE_CASE)
                .find(xml)?.groupValues?.getOrNull(1)?.decodeXml()?.takeIf(String::isNotBlank)
                ?: return@runCatching null
            val model = Regex("<modelName>(.*?)</modelName>", RegexOption.IGNORE_CASE)
                .find(xml)?.groupValues?.getOrNull(1)?.decodeXml()?.takeIf(String::isNotBlank)
            friendly to model
        }
    }.getOrNull()

    private fun canConnect(host: String, port: Int, timeoutMs: Int): Boolean = runCatching {
        Socket().use { socket ->
            socket.connect(InetSocketAddress(host, port), timeoutMs)
            true
        }
    }.getOrDefault(false)

    private fun looksLikeLgTv(response: String): Boolean =
        response.contains("webos") || response.contains("lge") ||
            response.contains("lg smart") || response.contains("lg electronics")

    private fun cleanName(value: String): String = value
        .replace(Regex("\\s+"), " ")
        .trim()
        .take(64)

    private fun String.decodeXml(): String = replace("&amp;", "&")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&quot;", "\"")
        .replace("&#39;", "'")
}
