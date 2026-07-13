package com.geronimo.controlelgwifi

import android.appwidget.AppWidgetManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

class RemoteCommandReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val pendingResult = goAsync()
        CoroutineScope(SupervisorJob() + Dispatchers.IO).launch {
            try {
                when (intent.action) {
                    ACTION_WAKE -> HeadlessRemoteController.wake(context)
                    ACTION_COMMAND -> intent.getStringExtra(EXTRA_COMMAND)
                        ?.let { runCatching { RemoteAction.valueOf(it) }.getOrNull() }
                        ?.let { HeadlessRemoteController.send(context, it) }
                }
                LibreRemoteWidgetProvider.updateAll(context)
            } finally {
                pendingResult.finish()
            }
        }
    }

    companion object {
        const val ACTION_COMMAND = "io.github.grupogptespecialeng.libreremote.ACTION_COMMAND"
        const val ACTION_WAKE = "io.github.grupogptespecialeng.libreremote.ACTION_WAKE"
        const val EXTRA_COMMAND = "remote_command"
    }
}
