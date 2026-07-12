package com.geronimo.controlelgwifi

import android.content.Context

/**
 * Logical TV platforms supported or planned by Libre Remote.
 *
 * A platform is the protocol family used by the television, not only the brand.
 * For example, TCL models may use Roku TV, Google TV, Android TV or a proprietary OS.
 */
enum class TvPlatform {
    LgWebOs,
    SamsungTizenLocal,
    SamsungSmartThings,
    GoogleCast,
    AndroidTvExperimental,
    DlnaMedia,
    FireTvMedia,
    PhilipsJointSpaceExperimental,
    HisenseVidaaExperimental,
    RokuBlockedByPolicy,
    Unknown
}

enum class TvSupportLevel {
    StableFull,
    BetaFull,
    StableMediaOnly,
    Experimental,
    BlockedByVendorPolicy,
    Unsupported
}

data class TvBackendMetadata(
    val platform: TvPlatform,
    val supportLevel: TvSupportLevel,
    val displayName: String,
    val accountRequired: Boolean,
    val localOnly: Boolean,
    val notes: String
)

interface TvBackendListener {
    fun onConnectionState(state: ConnectionState, message: String, reconnectAttempt: Int = 0)
    fun onApps(apps: List<TvApp>)
    fun onInputs(inputs: List<TvInput>)
    fun onVolume(volume: Int?, muted: Boolean)
    fun onCapabilities(capabilities: Set<TvCapability>)
}

/**
 * Common contract used by the UI. A backend may expose only a subset of capabilities.
 * Unsupported functions must fail silently in the backend and remain hidden by the UI.
 */
interface TvBackend {
    val metadata: TvBackendMetadata
    val defaultCapabilities: Set<TvCapability>

    fun connect(device: TvDevice, userInitiated: Boolean = true)
    fun close()
    fun forgetDevice(device: TvDevice)
    fun send(action: RemoteAction)

    fun setMute(muted: Boolean) = Unit
    fun movePointer(dx: Int, dy: Int) = Unit
    fun clickPointer() = Unit
    fun scrollPointer(delta: Int) = Unit
    fun launchApp(app: TvApp) = Unit
    fun switchInput(input: TvInput) = Unit
    fun insertText(text: String) = Unit
    fun deleteText() = Unit
    fun sendNumber(number: Int) = Unit
    fun sendColor(color: String) = Unit
    fun refreshDeviceData() = Unit
}

/** Adapter that preserves the existing, tested LG implementation behind the universal API. */
class LgWebOsBackend(
    context: Context,
    private val listener: TvBackendListener
) : TvBackend, FastLgWebOsClient.Listener {

    private val client = FastLgWebOsClient(context, this)

    override val metadata = TvBackendMetadata(
        platform = TvPlatform.LgWebOs,
        supportLevel = TvSupportLevel.StableFull,
        displayName = "LG webOS",
        accountRequired = false,
        localOnly = true,
        notes = "Controle completo pela rede local; ligar depende de Wake-on-LAN e do modelo."
    )

    override val defaultCapabilities: Set<TvCapability> = TvCapability.lgDefaults

    override fun connect(device: TvDevice, userInitiated: Boolean) = client.connect(device, userInitiated)
    override fun close() = client.close()
    override fun forgetDevice(device: TvDevice) = client.forgetDevice(device.ip)
    override fun send(action: RemoteAction) = client.send(action)
    override fun setMute(muted: Boolean) = client.setMute(muted)
    override fun movePointer(dx: Int, dy: Int) = client.move(dx, dy)
    override fun clickPointer() = client.click()
    override fun scrollPointer(delta: Int) = client.scroll(delta)
    override fun launchApp(app: TvApp) = client.launchApp(app.id)
    override fun switchInput(input: TvInput) = client.switchInput(input.id)
    override fun insertText(text: String) = client.insertText(text)
    override fun deleteText() = client.deleteText()
    override fun sendNumber(number: Int) = client.sendNumber(number)
    override fun sendColor(color: String) = client.sendColor(color)
    override fun refreshDeviceData() = client.refreshDeviceData()

    override fun onConnectionState(state: ConnectionState, message: String, reconnectAttempt: Int) =
        listener.onConnectionState(state, message, reconnectAttempt)

    override fun onApps(apps: List<TvApp>) = listener.onApps(apps)
    override fun onInputs(inputs: List<TvInput>) = listener.onInputs(inputs)
    override fun onVolume(volume: Int?, muted: Boolean) = listener.onVolume(volume, muted)
    override fun onCapabilities(capabilities: Set<TvCapability>) = listener.onCapabilities(capabilities)
}

class TvBackendRegistry(
    context: Context,
    listener: TvBackendListener
) {
    private val lgBackend: TvBackend = LgWebOsBackend(context, listener)

    fun backendFor(platform: TvPlatform): TvBackend? = when (platform) {
        TvPlatform.LgWebOs -> lgBackend
        else -> null
    }

    fun availableMetadata(): List<TvBackendMetadata> = listOf(
        lgBackend.metadata,
        TvBackendMetadata(
            TvPlatform.SamsungTizenLocal,
            TvSupportLevel.Experimental,
            "Samsung Tizen local",
            accountRequired = false,
            localOnly = true,
            notes = "Protocolo local não documentado publicamente pela Samsung; requer testes por geração."
        ),
        TvBackendMetadata(
            TvPlatform.SamsungSmartThings,
            TvSupportLevel.BetaFull,
            "Samsung SmartThings",
            accountRequired = true,
            localOnly = false,
            notes = "Rota oficial em nuvem; exige autorização da conta SmartThings."
        ),
        TvBackendMetadata(
            TvPlatform.GoogleCast,
            TvSupportLevel.StableMediaOnly,
            "Google Cast",
            accountRequired = false,
            localOnly = false,
            notes = "Descoberta e controle de mídia; não substitui o controle completo do sistema."
        ),
        TvBackendMetadata(
            TvPlatform.DlnaMedia,
            TvSupportLevel.StableMediaOnly,
            "DLNA / UPnP",
            accountRequired = false,
            localOnly = true,
            notes = "Reprodução e transporte de mídia em aparelhos compatíveis."
        ),
        TvBackendMetadata(
            TvPlatform.RokuBlockedByPolicy,
            TvSupportLevel.BlockedByVendorPolicy,
            "Roku",
            accountRequired = false,
            localOnly = true,
            notes = "Não será ativado no app público enquanto a política da Roku proibir ECP em apps móveis de terceiros."
        )
    )
}
