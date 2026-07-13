package com.geronimo.controlelgwifi

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class PerformanceTrackerTest {
    @Test
    fun keepsBoundedWindowAndComputesPercentile() {
        val tracker = PerformanceTracker(maxSamples = 5)
        (1..10).forEach { tracker.recordCommandDispatch(it.toDouble()) }
        tracker.recordConnection(320)

        val snapshot = tracker.snapshot()
        assertEquals(5, snapshot.commandSampleCount)
        assertEquals(8.0, snapshot.averageCommandDispatchMs ?: 0.0, 0.001)
        assertEquals(10.0, snapshot.p95CommandDispatchMs ?: 0.0, 0.001)
        assertEquals(320L, snapshot.lastConnectionMs)
    }

    @Test
    fun ignoresInvalidSamples() {
        val tracker = PerformanceTracker()
        tracker.recordCommandDispatch(Double.NaN)
        tracker.recordCommandDispatch(-1.0)
        assertTrue(tracker.snapshot().commandSampleCount == 0)
    }
}
