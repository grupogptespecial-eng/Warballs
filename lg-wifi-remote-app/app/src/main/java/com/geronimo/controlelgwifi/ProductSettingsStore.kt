package com.geronimo.controlelgwifi

import android.content.Context
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.productDataStore by preferencesDataStore(name = "product_settings")

data class AccessibilitySettings(
    val highContrast: Boolean = false,
    val leftHanded: Boolean = false,
    val reducedMotion: Boolean = false,
    val largeControls: Boolean = false
)

class ProductSettingsStore(private val context: Context) {
    private object Keys {
        val highContrast = booleanPreferencesKey("high_contrast")
        val leftHanded = booleanPreferencesKey("left_handed")
        val reducedMotion = booleanPreferencesKey("reduced_motion")
        val largeControls = booleanPreferencesKey("large_controls")
        val migrationComplete = booleanPreferencesKey("legacy_migration_complete")
    }

    val accessibilitySettings: Flow<AccessibilitySettings> = context.productDataStore.data.map { preferences ->
        AccessibilitySettings(
            highContrast = preferences[Keys.highContrast] ?: false,
            leftHanded = preferences[Keys.leftHanded] ?: false,
            reducedMotion = preferences[Keys.reducedMotion] ?: false,
            largeControls = preferences[Keys.largeControls] ?: false
        )
    }

    suspend fun setAccessibilitySettings(value: AccessibilitySettings) {
        context.productDataStore.edit { preferences ->
            preferences[Keys.highContrast] = value.highContrast
            preferences[Keys.leftHanded] = value.leftHanded
            preferences[Keys.reducedMotion] = value.reducedMotion
            preferences[Keys.largeControls] = value.largeControls
        }
    }

    suspend fun migrateLegacyPreferences(remotePreferences: RemotePreferences) {
        context.productDataStore.edit { preferences ->
            if (preferences[Keys.migrationComplete] == true) return@edit
            preferences[Keys.migrationComplete] = true
            // The legacy store stays available for protocol credentials and existing UI settings.
            // DataStore takes ownership only of new cross-feature settings to avoid destructive migration.
        }
    }
}
