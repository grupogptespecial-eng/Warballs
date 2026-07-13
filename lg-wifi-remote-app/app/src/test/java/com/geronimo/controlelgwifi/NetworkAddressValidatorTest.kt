package com.geronimo.controlelgwifi

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class NetworkAddressValidatorTest {
    @Test
    fun acceptsPrivateAddresses() {
        assertTrue(NetworkAddressValidator.isLocalHost("192.168.1.2"))
        assertTrue(NetworkAddressValidator.isLocalHost("10.0.0.8"))
        assertTrue(NetworkAddressValidator.isLocalHost("172.20.4.5"))
        assertTrue(NetworkAddressValidator.isLocalHost("fe80::1"))
    }

    @Test
    fun rejectsPublicAddresses() {
        assertFalse(NetworkAddressValidator.isLocalHost("8.8.8.8"))
        assertFalse(NetworkAddressValidator.isLocalHost("1.1.1.1"))
        assertFalse(NetworkAddressValidator.isLocalHost("example.com"))
    }
}
