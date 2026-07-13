package com.geronimo.controlelgwifi

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.graphics.drawable.Icon
import android.service.quicksettings.Tile
import android.service.quicksettings.TileService
import android.widget.RemoteViews

object RemoteSystemActions {
    const val ACTION_WIDGET_COMMAND = "com.geronimo.controlelgwifi.WIDGET_COMMAND"
    const val EXTRA_COMMAND = "command"
    const val EXTRA_OPEN_DEVICES = "open_devices"

    fun sendWidgetCommand(context: Context, command: UniversalRemoteCommand) {
        val prefs = widgetPreferences(context)
        val device = prefs.getString(KEY_DEVICE_JSON, null)?.let(TvDeviceCodec::decode) ?: return
        val intent = Intent(context, MainActivity::class.java)
            .putExtra(EXTRA_COMMAND, command.name)
            .putExtra("widget_device_json", TvDeviceCodec.encode(device))
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        context.startActivity(intent)
    }

    fun persistWidgetDevice(context: Context, device: TvDevice?, connected: Boolean) {
        widgetPreferences(context).edit()
            .putString(KEY_DEVICE_JSON, device?.let(TvDeviceCodec::encode))
            .putBoolean(KEY_CONNECTED, connected)
            .apply()
        val widgetManager = AppWidgetManager.getInstance(context)
        val provider = ComponentName(context, RemoteWidgetProvider::class.java)
        widgetManager.getAppWidgetIds(provider).forEach { RemoteWidgetProvider.updateWidget(context, widgetManager, it) }
        RemoteTileService.requestListeningState(context, ComponentName(context, RemoteTileService::class.java))
    }

    internal fun widgetPreferences(context: Context): SharedPreferences =
        context.getSharedPreferences("widget_prefs", Context.MODE_PRIVATE)

    internal const val KEY_DEVICE_JSON = "device_json"
    internal const val KEY_CONNECTED = "connected"
}

class RemoteWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        appWidgetIds.forEach { updateWidget(context, appWidgetManager, it) }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == RemoteSystemActions.ACTION_WIDGET_COMMAND) {
            val command = intent.getStringExtra(RemoteSystemActions.EXTRA_COMMAND)
                ?.let { runCatching { UniversalRemoteCommand.valueOf(it) }.getOrNull() }
                ?: return
            RemoteSystemActions.sendWidgetCommand(context, command)
        }
    }

    companion object {
        fun updateWidget(context: Context, manager: AppWidgetManager, appWidgetId: Int) {
            val preferences = RemoteSystemActions.widgetPreferences(context)
            val device = preferences.getString(RemoteSystemActions.KEY_DEVICE_JSON, null)?.let(TvDeviceCodec::decode)
            val connected = preferences.getBoolean(RemoteSystemActions.KEY_CONNECTED, false)
            val views = RemoteViews(context.packageName, R.layout.widget_remote)
            views.setTextViewText(R.id.widget_title, device?.displayName ?: context.getString(R.string.widget_name))
            views.setTextViewText(
                R.id.widget_status,
                when {
                    device == null -> context.getString(R.string.widget_not_connected)
                    connected -> "${device.platform.shortLabel} • Conectada"
                    else -> "${device.platform.shortLabel} • Toque para reconectar"
                }
            )

            bind(views, context, R.id.widget_power, UniversalRemoteCommand.POWER)
            bind(views, context, R.id.widget_volume_down, UniversalRemoteCommand.VOLUME_DOWN)
            bind(views, context, R.id.widget_mute, UniversalRemoteCommand.MUTE)
            bind(views, context, R.id.widget_volume_up, UniversalRemoteCommand.VOLUME_UP)
            bind(views, context, R.id.widget_play_pause, UniversalRemoteCommand.MEDIA_PLAY_PAUSE)

            val openIntent = PendingIntent.getActivity(
                context,
                appWidgetId,
                Intent(context, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP),
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_title, openIntent)
            views.setOnClickPendingIntent(R.id.widget_status, openIntent)
            manager.updateAppWidget(appWidgetId, views)
        }

        private fun bind(views: RemoteViews, context: Context, viewId: Int, command: UniversalRemoteCommand) {
            val intent = Intent(context, RemoteWidgetProvider::class.java)
                .setAction(RemoteSystemActions.ACTION_WIDGET_COMMAND)
                .putExtra(RemoteSystemActions.EXTRA_COMMAND, command.name)
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                command.ordinal + 7000,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(viewId, pendingIntent)
        }
    }
}

class RemoteTileService : TileService() {
    override fun onStartListening() {
        super.onStartListening()
        val preferences = RemoteSystemActions.widgetPreferences(this)
        val connected = preferences.getBoolean(RemoteSystemActions.KEY_CONNECTED, false)
        val device = preferences.getString(RemoteSystemActions.KEY_DEVICE_JSON, null)?.let(TvDeviceCodec::decode)
        qsTile?.apply {
            state = if (connected) Tile.STATE_ACTIVE else Tile.STATE_INACTIVE
            label = getString(R.string.tile_name)
            subtitle = device?.displayName ?: getString(R.string.widget_not_connected)
            icon = Icon.createWithResource(this@RemoteTileService, R.drawable.ic_libre_remote)
            updateTile()
        }
    }

    override fun onClick() {
        super.onClick()
        val preferences = RemoteSystemActions.widgetPreferences(this)
        val connected = preferences.getBoolean(RemoteSystemActions.KEY_CONNECTED, false)
        if (connected) {
            RemoteSystemActions.sendWidgetCommand(this, UniversalRemoteCommand.MEDIA_PLAY_PAUSE)
        } else {
            startActivityAndCollapse(
                PendingIntent.getActivity(
                    this,
                    9100,
                    Intent(this, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
            )
        }
    }
}

object LauncherShortcuts {
    fun update(context: Context, devices: List<TvDevice>, defaultDeviceId: String?) {
        if (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.N_MR1) return
        val manager = context.getSystemService(android.content.pm.ShortcutManager::class.java) ?: return
        val prioritized = devices.sortedByDescending { it.stableId() == defaultDeviceId }.take(3)
        val shortcuts = prioritized.mapIndexed { index, device ->
            val intent = Intent(context, MainActivity::class.java)
                .setAction(Intent.ACTION_VIEW)
                .putExtra("shortcut_device_json", TvDeviceCodec.encode(device))
            android.content.pm.ShortcutInfo.Builder(context, "tv_${device.stableId().hashCode()}")
                .setShortLabel(device.displayName.take(20))
                .setLongLabel("Controle: ${device.displayName}")
                .setRank(index)
                .setIcon(Icon.createWithResource(context, R.drawable.ic_libre_remote))
                .setIntent(intent)
                .build()
        }
        manager.dynamicShortcuts = shortcuts
    }
}
