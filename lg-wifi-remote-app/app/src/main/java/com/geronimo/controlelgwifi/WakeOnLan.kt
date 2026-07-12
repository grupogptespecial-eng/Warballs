package com.geronimo.controlelgwifi

import android.content.Context
import android.net.DhcpInfo
import android.net.wifi.WifiManager
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetAddress

object WakeOnLan {
    fun send(context: Context, macText: String): Boolean {
        val clean = macText.replace("-", "").replace(":", "").replace(".", "")
        if (!clean.matches(Regex("[0-9A-Fa-f]{12}"))) return false

        val mac = ByteArray(6) { index ->
            clean.substring(index * 2, index * 2 + 2).toInt(16).toByte()
        }
        val magicPacket = ByteArray(6 + 16 * mac.size)
        repeat(6) { magicPacket[it] = 0xFF.toByte() }
        for (offset in 6 until magicPacket.size step mac.size) {
            System.arraycopy(mac, 0, magicPacket, offset, mac.size)
        }

        return runCatching {
            DatagramSocket().use { socket ->
                socket.broadcast = true
                val destinations = linkedSetOf(InetAddress.getByName("255.255.255.255"))
                directedBroadcast(context)?.let(destinations::add)
                destinations.forEach { destination ->
                    listOf(7, 9).forEach { port ->
                        socket.send(DatagramPacket(magicPacket, magicPacket.size, destination, port))
                    }
                }
            }
            true
        }.getOrDefault(false)
    }

    private fun directedBroadcast(context: Context): InetAddress? = runCatching {
        val wifi = context.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
        val dhcp: DhcpInfo = wifi.dhcpInfo ?: return null
        val broadcast = (dhcp.ipAddress and dhcp.netmask) or dhcp.netmask.inv()
        InetAddress.getByAddress(
            ByteArray(4) { index -> ((broadcast shr (index * 8)) and 0xFF).toByte() }
        )
    }.getOrNull()
}
