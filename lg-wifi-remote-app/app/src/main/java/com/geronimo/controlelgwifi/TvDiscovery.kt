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
        "urn:dial-multiscreen-org:service:dial:1",
        "ssdp:all"
    )

    private data class UpnpService(val type: String, val controlUrl: String?)
    private data class DeviceDescription(
        val friendlyName: String?,
        val model: String?,
        val manufacturer: String?,
        val deviceType: String?,
        val services: List<UpnpService>,
        val raw: String
    )

    suspend fun discover(
        context: Context,
        knownDevices: List<TvDevice> = emptyList(),
        durationMs: Long = 2_350
    ): List<TvDevice> = coroutineScope {
        val knownChecks = knownDevices.map { saved ->
            async(Dispatchers.IO) { saved.takeIf { isTvReachable(it, 430) } }
        }
        val ssdp = async(Dispatchers.IO) { discoverSsdp(context, durationMs) }
        val lgHostname = async(Dispatchers.IO) {
            runCatching {
                InetAddress.getByName("lgwebostv").hostAddress
                    ?.takeIf { canConnect(it, 3000, 350) || canConnect(it, 3001, 350) }
                    ?.let {
                        TvDevice(
                            ip = it,
                            name = "LG webOS TV",
                            manufacturer = "LG Electronics",
                            platform = TvPlatform.LgWebOs,
                            supportLevel = TvSupportLevel.StableFull,
                            stableId = "${TvPlatform.LgWebOs.name}:$it",
                            capabilities = TvCapability.lgDefaults
                        )
                    }
            }.getOrNull()
        }

        val all = buildList {
            addAll(knownChecks.awaitAll().filterNotNull())
            addAll(ssdp.await())
            lgHostname.await()?.let(::add)
        }
        deduplicate(all, knownDevices)
    }

    suspend fun identifyManual(rawAddress: String): TvDevice? = withContext(Dispatchers.IO) {
        val host = normalizeHost(rawAddress) ?: return@withContext null
        coroutineScope {
            val lg = async { canConnect(host, 3000, 500) || canConnect(host, 3001, 500) }
            val samsung = async { canConnect(host, 8001, 500) || canConnect(host, 8002, 500) }
            when {
                lg.await() -> TvDevice(
                    ip = host,
                    name = "LG webOS TV",
                    manufacturer = "LG Electronics",
                    platform = TvPlatform.LgWebOs,
                    supportLevel = TvSupportLevel.StableFull,
                    stableId = "${TvPlatform.LgWebOs.name}:$host",
                    capabilities = TvCapability.lgDefaults
                )
                samsung.await() -> TvDevice(
                    ip = host,
                    name = "Samsung Smart TV",
                    manufacturer = "Samsung",
                    platform = TvPlatform.SamsungTizenLocal,
                    supportLevel = TvSupportLevel.Experimental,
                    stableId = "${TvPlatform.SamsungTizenLocal.name}:$host",
                    capabilities = TvCapability.samsungDefaults
                )
                else -> TvDevice(
                    ip = host,
                    name = "Smart TV",
                    platform = TvPlatform.Unknown,
                    supportLevel = TvSupportLevel.Unsupported,
                    stableId = "${TvPlatform.Unknown.name}:$host",
                    capabilities = emptySet()
                )
            }
        }
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
        val port3000 = device?.takeIf { it.platform == TvPlatform.LgWebOs }?.ip?.let { canConnect(it, 3000, 650) }
        val port3001 = device?.takeIf { it.platform == TvPlatform.LgWebOs }?.ip?.let { canConnect(it, 3001, 650) }
        val reachable = device?.let { isTvReachable(it, 650) }
        val backendSummary = device?.let {
            when (it.platform) {
                TvPlatform.LgWebOs -> "LG webOS: WebSocket local nas portas 3000/3001"
                TvPlatform.SamsungTizenLocal -> "Samsung Tizen experimental: WebSocket local nas portas 8001/8002"
                TvPlatform.DlnaMedia -> "DLNA: ${listOfNotNull(it.avTransportUrl?.let { "AVTransport" }, it.renderingControlUrl?.let { "RenderingControl" }).joinToString(" + ").ifBlank { "sem serviço de controle" }}"
                else -> "${it.platformLabel}: ${it.supportLabel}"
            }
        }
        val summary = when {
            !wifiConnected -> "O celular não está conectado a uma rede Wi-Fi ou Ethernet."
            device == null -> "Rede pronta. Selecione uma TV para testar a conexão."
            reachable == true -> "A TV respondeu usando ${device.platformLabel}."
            else -> "A TV não respondeu. Confira se está ligada e se o roteador não isola dispositivos."
        }
        NetworkDiagnostic(
            wifiConnected = wifiConnected,
            multicastAvailable = null,
            localAddress = localAddress,
            tvReachable = reachable,
            port3000Reachable = port3000,
            port3001Reachable = port3001,
            backendSummary = backendSummary,
            summary = summary
        )
    }

    fun isTvReachable(device: TvDevice, timeoutMs: Int = 500): Boolean = when (device.platform) {
        TvPlatform.LgWebOs -> canConnect(device.ip, 3000, timeoutMs) || canConnect(device.ip, 3001, timeoutMs)
        TvPlatform.SamsungTizenLocal -> canConnect(device.ip, 8001, timeoutMs) || canConnect(device.ip, 8002, timeoutMs)
        TvPlatform.DlnaMedia -> listOfNotNull(device.avTransportUrl, device.renderingControlUrl, device.descriptionUrl)
            .any { canReachHttp(it, timeoutMs) }
        TvPlatform.RokuBlockedByPolicy -> canConnect(device.ip, 8060, timeoutMs)
        else -> canConnect(device.ip, 80, timeoutMs) || canConnect(device.ip, 443, timeoutMs)
    }

    private fun discoverSsdp(context: Context, durationMs: Long): List<TvDevice> {
        val devices = mutableListOf<TvDevice>()
        val wifi = context.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
        val multicastLock = wifi.createMulticastLock("libre-remote-universal-discovery").apply { setReferenceCounted(false) }
        try {
            multicastLock.acquire()
            DatagramSocket(null).use { socket ->
                socket.reuseAddress = true
                socket.broadcast = true
                socket.soTimeout = 220
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
                    if (round == 0) Thread.sleep(65)
                }
                val deadline = System.currentTimeMillis() + durationMs
                val buffer = ByteArray(16_384)
                val seenResponses = mutableSetOf<String>()
                while (System.currentTimeMillis() < deadline) {
                    try {
                        val packet = DatagramPacket(buffer, buffer.size)
                        socket.receive(packet)
                        val response = String(packet.data, 0, packet.length, Charsets.UTF_8)
                        val headers = parseHeaders(response)
                        val location = headers["location"]
                        val ip = runCatching { location?.let { URI(it).host } }.getOrNull()
                            ?: packet.address.hostAddress
                            ?: continue
                        val responseKey = "$ip|${location.orEmpty()}|${headers["st"].orEmpty()}"
                        if (!seenResponses.add(responseKey)) continue
                        val description = location?.takeIf(::isLocalUrl)?.let(::fetchDescription)
                        classifyDevice(ip, location, response, headers, description)?.let(devices::add)
                    } catch (_: SocketTimeoutException) {
                        // Continue collecting until the shared deadline.
                    }
                }
            }
        } catch (_: Exception) {
            // Known-device probing and manual connection remain available.
        } finally {
            if (multicastLock.isHeld) multicastLock.release()
        }
        return devices
    }

    private fun classifyDevice(
        ip: String,
        location: String?,
        response: String,
        headers: Map<String, String>,
        description: DeviceDescription?
    ): TvDevice? {
        val combined = buildString {
            append(response)
            append('\n')
            append(description?.raw.orEmpty())
            append('\n')
            append(description?.manufacturer.orEmpty())
            append('\n')
            append(description?.model.orEmpty())
        }.lowercase(Locale.ROOT)
        val serviceTypes = description?.services?.map { it.type.lowercase(Locale.ROOT) }.orEmpty()
        val avTransport = description?.services?.firstOrNull { it.type.contains("AVTransport", true) }?.controlUrl
        val rendering = description?.services?.firstOrNull { it.type.contains("RenderingControl", true) }?.controlUrl
        val isRenderer = description?.deviceType?.contains("MediaRenderer", true) == true ||
            serviceTypes.any { it.contains("avtransport") }

        val platform = when {
            combined.contains("webos") || combined.contains("lge") || combined.contains("lg electronics") -> TvPlatform.LgWebOs
            combined.contains("samsung") || combined.contains("tizen") -> TvPlatform.SamsungTizenLocal
            combined.contains("roku") -> TvPlatform.RokuBlockedByPolicy
            combined.contains("chromecast") || combined.contains("google cast") -> TvPlatform.GoogleCast
            combined.contains("vidaa") || combined.contains("hisense") -> TvPlatform.HisenseVidaaExperimental
            combined.contains("philips") && combined.contains("jointspace") -> TvPlatform.PhilipsJointSpaceExperimental
            isRenderer && avTransport != null -> TvPlatform.DlnaMedia
            else -> return null
        }
        val support = platform.defaultSupportLevel
        val fallbackName = when (platform) {
            TvPlatform.LgWebOs -> "LG webOS TV"
            TvPlatform.SamsungTizenLocal -> "Samsung Smart TV"
            TvPlatform.DlnaMedia -> "TV DLNA"
            else -> platform.displayName
        }
        val name = cleanName(
            description?.friendlyName
                ?: headers["dlna.devicename.lge.com"]
                ?: headers["server"]?.takeIf { it.length <= 80 }
                ?: fallbackName
        )
        return TvDevice(
            ip = ip,
            name = name,
            model = description?.model,
            manufacturer = description?.manufacturer,
            platform = platform,
            supportLevel = support,
            stableId = "$platform:$ip",
            descriptionUrl = location,
            avTransportUrl = avTransport,
            renderingControlUrl = rendering,
            capabilities = platform.defaultCapabilities(
                hasAvTransport = avTransport != null,
                hasRenderingControl = rendering != null
            )
        )
    }

    private fun deduplicate(all: List<TvDevice>, knownDevices: List<TvDevice>): List<TvDevice> {
        val priorities = mapOf(
            TvPlatform.LgWebOs to 100,
            TvPlatform.SamsungTizenLocal to 90,
            TvPlatform.SamsungSmartThings to 80,
            TvPlatform.GoogleCast to 60,
            TvPlatform.DlnaMedia to 50,
            TvPlatform.AndroidTvExperimental to 40,
            TvPlatform.FireTvMedia to 40,
            TvPlatform.PhilipsJointSpaceExperimental to 30,
            TvPlatform.HisenseVidaaExperimental to 30,
            TvPlatform.RokuBlockedByPolicy to 10,
            TvPlatform.Unknown to 0
        )
        return all.groupBy(TvDevice::ip).map { (_, variants) ->
            val chosen = variants.maxByOrNull { priorities[it.platform] ?: 0 } ?: variants.first()
            val saved = knownDevices.firstOrNull { it.stableId == chosen.stableId }
                ?: knownDevices.firstOrNull { it.ip == chosen.ip && it.platform == chosen.platform }
            chosen.copy(
                name = saved?.name?.takeIf { it.isNotBlank() && it !in setOf("LG webOS TV", "Smart TV") } ?: chosen.name,
                room = saved?.room.orEmpty(),
                mac = saved?.mac,
                stableId = saved?.stableId ?: chosen.stableId,
                capabilities = if (chosen.capabilities.isNotEmpty()) chosen.capabilities else saved?.capabilities.orEmpty(),
                lastSeenAt = System.currentTimeMillis()
            )
        }.sortedWith(
            compareByDescending<TvDevice> { knownDevices.any { saved -> saved.stableId == it.stableId } }
                .thenByDescending { priorities[it.platform] ?: 0 }
                .thenBy(TvDevice::displayName)
        )
    }

    private fun parseHeaders(response: String): Map<String, String> = response.lineSequence()
        .mapNotNull { line ->
            val index = line.indexOf(':')
            if (index <= 0) null else line.substring(0, index).trim().lowercase() to line.substring(index + 1).trim()
        }
        .toMap()

    private fun fetchDescription(location: String): DeviceDescription? = runCatching {
        val connection = URL(location).openConnection() as HttpURLConnection
        connection.connectTimeout = 650
        connection.readTimeout = 800
        connection.instanceFollowRedirects = false
        connection.setRequestProperty("Connection", "close")
        connection.inputStream.bufferedReader().use { reader ->
            val xml = reader.readText().take(260_000)
            val friendly = tag(xml, "friendlyName")
            val model = tag(xml, "modelName")
            val manufacturer = tag(xml, "manufacturer")
            val deviceType = tag(xml, "deviceType")
            val services = Regex("<service>(.*?)</service>", setOf(RegexOption.IGNORE_CASE, RegexOption.DOT_MATCHES_ALL))
                .findAll(xml)
                .mapNotNull { block ->
                    val body = block.groupValues.getOrNull(1).orEmpty()
                    val type = tag(body, "serviceType") ?: return@mapNotNull null
                    val control = tag(body, "controlURL")?.let { resolveUrl(location, it) }
                    UpnpService(type, control)
                }
                .toList()
            DeviceDescription(friendly, model, manufacturer, deviceType, services, xml)
        }
    }.getOrNull()

    private fun tag(xml: String, name: String): String? = Regex(
        "<$name(?:\\s[^>]*)?>(.*?)</$name>",
        setOf(RegexOption.IGNORE_CASE, RegexOption.DOT_MATCHES_ALL)
    ).find(xml)?.groupValues?.getOrNull(1)?.decodeXml()?.trim()?.takeIf(String::isNotBlank)

    private fun resolveUrl(base: String, child: String): String? = runCatching {
        URI(base).resolve(child.trim()).toString().takeIf(::isLocalUrl)
    }.getOrNull()

    private fun canReachHttp(url: String, timeoutMs: Int): Boolean = runCatching {
        if (!isLocalUrl(url)) return@runCatching false
        val uri = URI(url)
        val port = if (uri.port > 0) uri.port else if (uri.scheme.equals("https", true)) 443 else 80
        canConnect(uri.host, port, timeoutMs)
    }.getOrDefault(false)

    internal fun canConnect(host: String, port: Int, timeoutMs: Int): Boolean = runCatching {
        Socket().use { socket ->
            socket.connect(InetSocketAddress(host, port), timeoutMs)
            true
        }
    }.getOrDefault(false)

    private fun normalizeHost(raw: String): String? {
        val value = raw.trim()
            .removePrefix("http://")
            .removePrefix("https://")
            .substringBefore('/')
            .substringBefore(':')
        return value.takeIf { it.isNotBlank() && NetworkAddressValidator.isLocalHost(it) }
    }

    private fun isLocalUrl(value: String): Boolean = runCatching {
        val uri = URI(value)
        val host = uri.host ?: return@runCatching false
        (uri.scheme == "http" || uri.scheme == "https") && NetworkAddressValidator.isLocalHost(host)
    }.getOrDefault(false)

    private fun cleanName(value: String): String = value
        .replace(Regex("<[^>]+>"), " ")
        .replace(Regex("\\s+"), " ")
        .trim()
        .take(64)

    private fun String.decodeXml(): String = replace("&amp;", "&")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&quot;", "\"")
        .replace("&#39;", "'")
}
