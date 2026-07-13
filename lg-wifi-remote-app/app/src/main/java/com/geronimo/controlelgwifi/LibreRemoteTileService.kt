package com.geronimo.controlelgwifi

import android.os.Build
import android.service.quicksettings.Tile
import android.service.quicksettings.TileService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

class LibreRemoteTileService : TileService() {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    override fun onStartListening() {
        super.onStartListening()
        val device = RemotePreferences(this).loadCurrentDevice()
        qsTile?.apply {
            label = "Libre Remote"
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                subtitle = device?.displayName ?: "Selecione uma TV"
            }
            state = if (device == null) Tile.STATE_INACTIVE else Tile.STATE_ACTIVE
            updateTile()
        }
    }

    override fun onClick() {
        super.onClick()
        val device = RemotePreferences(this).loadCurrentDevice()
        if (device == null) {
            packageManager.getLaunchIntentForPackage(packageName)?.let(::startActivityAndCollapse)
            return
        }
        qsTile?.state = Tile.STATE_UNAVAILABLE
        qsTile?.updateTile()
        scope.launch {
            HeadlessRemoteController.send(this@LibreRemoteTileService, RemoteAction.PlayPause)
            qsTile?.state = Tile.STATE_ACTIVE
            qsTile?.updateTile()
        }
    }
}
