package com.geronimo.controlelgwifi

import java.util.ArrayDeque
import kotlin.math.ceil

/**
 * Keeps a small in-memory performance window. No metrics leave the device.
 */
class PerformanceTracker(private val maxSamples: Int = 120) {
    private val commandSamples = ArrayDeque<Double>(maxSamples)
    private val lock = Any()

    @Volatile
    private var lastConnectionMs: Long? = null

    fun recordCommandDispatch(milliseconds: Double) {
        if (!milliseconds.isFinite() || milliseconds < 0.0) return
        synchronized(lock) {
            while (commandSamples.size >= maxSamples && commandSamples.isNotEmpty()) {
                commandSamples.removeFirst()
            }
            commandSamples.addLast(milliseconds)
        }
    }

    fun recordConnection(milliseconds: Long) {
        if (milliseconds >= 0L) lastConnectionMs = milliseconds
    }

    fun snapshot(): PerformanceSnapshot {
        val samples = synchronized(lock) { commandSamples.toList() }
        if (samples.isEmpty()) {
            return PerformanceSnapshot(lastConnectionMs = lastConnectionMs)
        }
        val sorted = samples.sorted()
        val p95Index = (ceil(sorted.size * 0.95).toInt() - 1).coerceIn(sorted.indices)
        return PerformanceSnapshot(
            lastCommandDispatchMs = samples.last(),
            averageCommandDispatchMs = samples.average(),
            p95CommandDispatchMs = sorted[p95Index],
            commandSampleCount = samples.size,
            lastConnectionMs = lastConnectionMs
        )
    }
}

data class PerformanceSnapshot(
    val lastCommandDispatchMs: Double? = null,
    val averageCommandDispatchMs: Double? = null,
    val p95CommandDispatchMs: Double? = null,
    val commandSampleCount: Int = 0,
    val lastConnectionMs: Long? = null
)
