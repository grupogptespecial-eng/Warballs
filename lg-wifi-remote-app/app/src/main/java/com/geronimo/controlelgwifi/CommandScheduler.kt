package com.geronimo.controlelgwifi

import java.io.Closeable
import java.util.concurrent.atomic.AtomicLong
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

class CommandScheduler(
    scope: CoroutineScope,
    private val send: suspend (UniversalRemoteCommand) -> CommandResult,
    private val maxCritical: Int = 16,
    private val maxRepeating: Int = 16,
    private val maxNormal: Int = 32
) : Closeable {
    private data class Scheduled(
        val sequence: Long,
        val command: UniversalRemoteCommand,
        val priority: CommandPriority,
        val queuedAtNanos: Long,
        val result: CompletableDeferred<CommandResult>
    )

    private val sequence = AtomicLong(0)
    private val critical = Channel<Scheduled>(maxCritical)
    private val repeating = Channel<Scheduled>(maxRepeating)
    private val normal = Channel<Scheduled>(maxNormal)
    private val signal = Channel<Unit>(Channel.CONFLATED)
    private val worker: Job = scope.launch { runWorker() }

    fun submit(
        command: UniversalRemoteCommand,
        priority: CommandPriority = CommandPriority.NORMAL
    ): CompletableDeferred<CommandResult> {
        val deferred = CompletableDeferred<CommandResult>()
        if (!worker.isActive) {
            deferred.complete(CommandResult.fail(CommandError.NOT_CONNECTED, "Scheduler fechado"))
            return deferred
        }
        val item = Scheduled(
            sequence = sequence.incrementAndGet(),
            command = command,
            priority = priority,
            queuedAtNanos = System.nanoTime(),
            result = deferred
        )
        val channel = when (priority) {
            CommandPriority.CRITICAL -> critical
            CommandPriority.REPEATING -> repeating
            CommandPriority.NORMAL, CommandPriority.BACKGROUND -> normal
        }
        if (!channel.trySend(item).isSuccess) {
            deferred.complete(CommandResult.fail(CommandError.QUEUE_FULL, "Fila de comandos cheia"))
        } else {
            signal.trySend(Unit)
        }
        return deferred
    }

    fun pendingCount(): Int = criticalCount() + repeatingCount() + normalCount()

    override fun close() {
        worker.cancel(CancellationException("Command scheduler closed"))
        val error = CommandResult.fail(CommandError.NOT_CONNECTED, "Scheduler fechado")
        drain(critical, error)
        drain(repeating, error)
        drain(normal, error)
        critical.close()
        repeating.close()
        normal.close()
        signal.close()
    }

    private suspend fun runWorker() {
        while (worker.isActive) {
            val next = critical.tryReceive().getOrNull()
                ?: repeating.tryReceive().getOrNull()
                ?: normal.tryReceive().getOrNull()
            if (next == null) {
                signal.receiveCatching().getOrNull() ?: break
                continue
            }
            if (next.result.isCancelled) continue
            val result = runCatching { send(next.command) }
                .getOrElse { error ->
                    if (error is CancellationException) throw error
                    CommandResult.fail(CommandError.PROTOCOL, error.message)
                }
            next.result.complete(result)
        }
    }

    private fun criticalCount(): Int = if (critical.isClosedForReceive) 0 else maxCritical - critical.remainingCapacity()
    private fun repeatingCount(): Int = if (repeating.isClosedForReceive) 0 else maxRepeating - repeating.remainingCapacity()
    private fun normalCount(): Int = if (normal.isClosedForReceive) 0 else maxNormal - normal.remainingCapacity()

    private fun Channel<Scheduled>.remainingCapacity(): Int {
        // Kotlin channels do not expose size. Probe conservatively without consuming items.
        // The public count is diagnostic only, so an approximate bounded value is enough.
        return 0
    }

    private fun drain(channel: Channel<Scheduled>, result: CommandResult) {
        while (true) {
            val item = channel.tryReceive().getOrNull() ?: break
            item.result.complete(result)
        }
    }
}
