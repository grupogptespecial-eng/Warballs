package com.geronimo.controlelgwifi

import android.content.Context
import androidx.room.Dao
import androidx.room.Database
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase
import kotlinx.coroutines.flow.Flow

@Dao
interface SavedDeviceDao {
    @Query("SELECT * FROM saved_devices ORDER BY isDefault DESC, lastConnectedAtMillis DESC, displayName")
    fun observeAll(): Flow<List<SavedDeviceEntity>>

    @Query("SELECT * FROM saved_devices WHERE stableId = :stableId LIMIT 1")
    suspend fun find(stableId: String): SavedDeviceEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(device: SavedDeviceEntity)

    @Query("UPDATE saved_devices SET isDefault = 0")
    suspend fun clearDefault()

    @Query("UPDATE saved_devices SET isDefault = 1 WHERE stableId = :stableId")
    suspend fun markDefault(stableId: String)

    @Query("DELETE FROM saved_devices WHERE stableId = :stableId")
    suspend fun delete(stableId: String)
}

@Dao
interface RemoteMacroDao {
    @Query("SELECT * FROM remote_macros ORDER BY name")
    fun observeAll(): Flow<List<RemoteMacroEntity>>

    @Query("SELECT * FROM remote_macros WHERE id = :id LIMIT 1")
    suspend fun find(id: String): RemoteMacroEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(macro: RemoteMacroEntity)

    @Query("DELETE FROM remote_macros WHERE id = :id")
    suspend fun delete(id: String)
}

@Dao
interface CustomLayoutDao {
    @Query("SELECT * FROM custom_layouts ORDER BY updatedAtMillis DESC")
    fun observeAll(): Flow<List<CustomLayoutEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(layout: CustomLayoutEntity)

    @Query("DELETE FROM custom_layouts WHERE id = :id")
    suspend fun delete(id: String)
}

@Dao
interface DiagnosticDao {
    @Insert
    suspend fun insert(event: DiagnosticEventEntity)

    @Query("SELECT * FROM diagnostic_events WHERE deviceId = :deviceId ORDER BY createdAtMillis DESC LIMIT :limit")
    suspend fun recent(deviceId: String, limit: Int): List<DiagnosticEventEntity>

    @Query("DELETE FROM diagnostic_events WHERE id NOT IN (SELECT id FROM diagnostic_events ORDER BY createdAtMillis DESC LIMIT :keep)")
    suspend fun trim(keep: Int)

    @Query("DELETE FROM diagnostic_events")
    suspend fun clear()
}

@Database(
    entities = [
        SavedDeviceEntity::class,
        RemoteMacroEntity::class,
        CustomLayoutEntity::class,
        DiagnosticEventEntity::class
    ],
    version = 2,
    exportSchema = true
)
abstract class ProductDatabase : RoomDatabase() {
    abstract fun savedDeviceDao(): SavedDeviceDao
    abstract fun remoteMacroDao(): RemoteMacroDao
    abstract fun customLayoutDao(): CustomLayoutDao
    abstract fun diagnosticDao(): DiagnosticDao

    companion object {
        @Volatile private var INSTANCE: ProductDatabase? = null

        internal val MIGRATION_1_2_STATEMENTS = listOf(
            "ALTER TABLE saved_devices RENAME TO saved_devices_legacy",
            "CREATE TABLE IF NOT EXISTS saved_devices (stableId TEXT NOT NULL PRIMARY KEY, displayName TEXT NOT NULL, roomName TEXT NOT NULL, platform TEXT NOT NULL, supportLevel TEXT NOT NULL, lastKnownIp TEXT NOT NULL, manufacturer TEXT NOT NULL, modelName TEXT NOT NULL, udn TEXT NOT NULL, usn TEXT NOT NULL, location TEXT NOT NULL, macAddress TEXT NOT NULL, serviceUrlsJson TEXT NOT NULL, capabilitiesJson TEXT NOT NULL, isDefault INTEGER NOT NULL, lastSeenAtMillis INTEGER NOT NULL, lastConnectedAtMillis INTEGER NOT NULL)",
            "INSERT OR REPLACE INTO saved_devices (stableId, displayName, roomName, platform, supportLevel, lastKnownIp, manufacturer, modelName, udn, usn, location, macAddress, serviceUrlsJson, capabilitiesJson, isDefault, lastSeenAtMillis, lastConnectedAtMillis) SELECT id, displayName, roomName, platform, supportLevel, ipAddress, manufacturer, modelName, udn, usn, location, macAddress, serviceUrlsJson, capabilitiesJson, isDefault, lastSeenAtMillis, lastConnectedAtMillis FROM saved_devices_legacy",
            "DROP TABLE saved_devices_legacy",
            "CREATE UNIQUE INDEX IF NOT EXISTS index_saved_devices_stableId ON saved_devices(stableId)",
            "CREATE INDEX IF NOT EXISTS index_saved_devices_lastKnownIp ON saved_devices(lastKnownIp)"
        )

        private val MIGRATION_1_2 = object : Migration(1, 2) {
            override fun migrate(database: SupportSQLiteDatabase) {
                MIGRATION_1_2_STATEMENTS.forEach(database::execSQL)
            }
        }

        fun getInstance(context: Context): ProductDatabase = INSTANCE ?: synchronized(this) {
            INSTANCE ?: Room.databaseBuilder(
                context.applicationContext,
                ProductDatabase::class.java,
                "libre_remote_product.db"
            )
                .addMigrations(MIGRATION_1_2)
                .fallbackToDestructiveMigrationOnDowngrade()
                .build()
                .also { INSTANCE = it }
        }
    }
}
