package com.geronimo.controlelgwifi

import java.util.ArrayDeque
import kotlin.math.ceil

class PerformanceTracker(private val maxSamples: Int = 200) {
    private val commandLatency = ArrayDeque<Long>()
    private val queueDelay = ArrayDeque<Long>()
    private val connectionLatency = ArrayDeque<Long>()

    @Synchronized
    fun recordCommand(latencyMillis: Long, queueDelayMillis: Long) {
        if (latencyMillis >= 0) append(commandLatency, latencyMillis)
        if (queueDelayMillis >= 0) append(queueDelay, queueDelayMillis)
    }

    @Synchronized
    fun recordConnection(latencyMillis: Long) {
        if (latencyMillis >= 0) append(connectionLatency, latencyMillis)
    }

    @Synchronized
    fun snapshot(): PerformanceSnapshot = PerformanceSnapshot(
        commandSamples = commandLatency.size,
        commandP50Millis = percentile(commandLatency, 0.50),
        commandP95Millis = percentile(commandLatency, 0.95),
        queueP95Millis = percentile(queueDelay, 0.95),
        connectionP50Millis = percentile(connectionLatency, 0.50),
        connectionP95Millis = percentile(connectionLatency, 0.95)
    )

    @Synchronized
    fun clear() {
        commandLatency.clear()
        queueDelay.clear()
        connectionLatency.clear()
    }

    private fun append(queue: ArrayDeque<Long>, value: Long) {
        while (queue.size >= maxSamples) queue.removeFirst()
        queue.addLast(value)
    }

    private fun percentile(values: Collection<Long>, quantile: Double): Long {
        if (values.isEmpty()) return 0
        val sorted = values.sorted()
        val index = (ceil(sorted.size * quantile).toInt() - 1).coerceIn(sorted.indices)
        return sorted[index]
    }
}

data class PerformanceSnapshot(
    val commandSamples: Int = 0,
    val commandP50Millis: Long = 0,
    val commandP95Millis: Long = 0,
    val queueP95Millis: Long = 0,
    val connectionP50Millis: Long = 0,
    val connectionP95Millis: Long = 0
)
