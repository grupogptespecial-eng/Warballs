package com.geronimo.controlelgwifi

import android.content.Context
import android.net.wifi.WifiManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetAddress
import java.net.InetSocketAddress
import java.net.SocketTimeoutException
import java.net.URI
import java.util.Locale

object TvDiscovery {
    private val searchTargets = listOf(
        "urn:lge-com:service:webos-second-screen:1",
        "urn:schemas-upnp-org:device:MediaRenderer:1",
        "ssdp:all"
    )

    suspend fun discover(context: Context, durationMs: Long = 3_500): List<TvDevice> = withContext(Dispatchers.IO) {
        val devices = linkedMapOf<String, TvDevice>()
        val wifi = context.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
        val multicastLock = wifi.createMulticastLock("libre-remote-discovery").apply {
            setReferenceCounted(false)
        }

        try {
            multicastLock.acquire()
            DatagramSocket(null).use { socket ->
                socket.reuseAddress = true
                socket.broadcast = true
                socket.soTimeout = 350
                socket.bind(InetSocketAddress(0))

                val multicastAddress = InetAddress.getByName("239.255.255.250")
                searchTargets.forEach { target ->
                    val request = buildString {
                        append("M-SEARCH * HTTP/1.1\r\n")
                        append("HOST: 239.255.255.250:1900\r\n")
                        append("MAN: \"ssdp:discover\"\r\n")
                        append("MX: 2\r\n")
                        append("ST: $target\r\n\r\n")
                    }.toByteArray(Charsets.UTF_8)
                    socket.send(DatagramPacket(request, request.size, multicastAddress, 1900))
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

                        val headers = response.lineSequence()
                            .mapNotNull { line ->
                                val index = line.indexOf(':')
                                if (index <= 0) null else line.substring(0, index).trim().lowercase() to line.substring(index + 1).trim()
                            }
                            .toMap()

                        val location = headers["location"]
                        val ip = runCatching { location?.let { URI(it).host } }.getOrNull()
                            ?: packet.address.hostAddress
                            ?: continue
                        val friendlyName = headers["server"]
                            ?.replace(Regex("\\s+"), " ")
                            ?.take(55)
                            ?: "LG webOS TV"
                        devices[ip] = TvDevice(ip = ip, name = friendlyName)
                    } catch (_: SocketTimeoutException) {
                        // Continue collecting until the deadline.
                    }
                }
            }
        } catch (_: Exception) {
            // Manual IP remains available when multicast is blocked by the router.
        } finally {
            if (multicastLock.isHeld) multicastLock.release()
        }

        devices.values.toList()
    }

    private fun looksLikeLgTv(response: String): Boolean =
        response.contains("webos") ||
            response.contains("lge") ||
            response.contains("lg smart") ||
            response.contains("lg electronics")
}
