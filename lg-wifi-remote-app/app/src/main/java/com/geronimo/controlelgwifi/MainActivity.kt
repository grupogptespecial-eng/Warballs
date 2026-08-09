package com.geronimo.controlelgwifi

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.speech.RecognizerIntent
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material.icons.rounded.Devices
import androidx.compose.material.icons.rounded.ErrorOutline
import androidx.compose.material.icons.rounded.Mic
import androidx.compose.material.icons.rounded.MoreHoriz
import androidx.compose.material.icons.rounded.PowerSettingsNew
import androidx.compose.material.icons.rounded.Refresh
import androidx.compose.material.icons.rounded.Search
import androidx.compose.material.icons.rounded.Settings
import androidx.compose.material.icons.rounded.TouchApp
import androidx.compose.material.icons.rounded.Tv
import androidx.compose.material.icons.rounded.Wifi
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val remoteViewModel: RemoteViewModel = viewModel()
            val state by remoteViewModel.uiState.collectAsStateWithLifecycle()
            LibreRemoteTheme(state.themeMode, state.accentTheme) {
                CompositionLocalProvider(
                    LocalAppLanguage provides state.appLanguage.resolved(),
                    LocalButtonEffect provides state.buttonEffect,
                    LocalAnimationPreset provides state.animationPreset
                ) {
                    LibreRemoteApp(state, remoteViewModel)
                }
            }
        }
    }
}

@Composable
private fun LibreRemoteApp(state: RemoteUiState, viewModel: RemoteViewModel) {
    val context = LocalContext.current
    val localNetworkPermission = "android.permission.ACCESS_LOCAL_NETWORK"
    val permissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (granted) viewModel.openConnect() else viewModel.permissionDenied()
    }
    val voiceLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            result.data
                ?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)
                ?.firstOrNull()
                ?.let(viewModel::handleVoiceTranscript)
        }
    }
    val voicePrompt = tr("Fale um comando ou dite um texto")
    val startVoice: () -> Unit = {
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_PROMPT, voicePrompt)
            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3)
            val selectedTag = state.voiceLanguage.tag
            if (selectedTag != null) {
                putExtra(RecognizerIntent.EXTRA_LANGUAGE, selectedTag)
            } else if (Build.VERSION.SDK_INT >= 34) {
                val supported = arrayListOf("pt-BR", "en-US", "es-ES", "fr-FR", "de-DE", "it-IT")
                putExtra(RecognizerIntent.EXTRA_ENABLE_LANGUAGE_DETECTION, true)
                putStringArrayListExtra(
                    RecognizerIntent.EXTRA_LANGUAGE_DETECTION_ALLOWED_LANGUAGES,
                    supported
                )
                putExtra(
                    RecognizerIntent.EXTRA_ENABLE_LANGUAGE_SWITCH,
                    RecognizerIntent.LANGUAGE_SWITCH_BALANCED
                )
                putStringArrayListExtra(
                    RecognizerIntent.EXTRA_LANGUAGE_SWITCH_ALLOWED_LANGUAGES,
                    supported
                )
            } else {
                state.appLanguage.resolved().tag?.let {
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE, it)
                }
            }
        }
        runCatching { voiceLauncher.launch(intent) }
            .onFailure { viewModel.voiceUnavailable() }
    }
    val openConnect: () -> Unit = {
        if (
            Build.VERSION.SDK_INT >= 37 &&
            ContextCompat.checkSelfPermission(context, localNetworkPermission) != PackageManager.PERMISSION_GRANTED
        ) {
            permissionLauncher.launch(localNetworkPermission)
        } else {
            viewModel.openConnect()
        }
    }

    var confirmPowerOff by rememberSaveable { mutableStateOf(false) }

    Box(
        Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        AnimatedRemoteBackground(
            effect = state.backgroundEffect,
            animation = state.animationPreset
        )
        Scaffold(
            modifier = Modifier.fillMaxSize(),
            containerColor = Color.Transparent,
            topBar = {
                AppHeader(
                    state = state,
                    onDeviceClick = openConnect,
                    onSettings = viewModel::openSettings,
                    onVoice = startVoice,
                    onPower = {
                        if (state.connected) confirmPowerOff = true else viewModel.wake()
                    },
                    onReconnect = viewModel::reconnect
                )
            }
        ) { padding ->
            Box(
                Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .navigationBarsPadding()
            ) {
                if (state.currentDevice == null && !state.connected) {
                    WelcomeScreen(state, openConnect, viewModel::runDiagnostics)
                } else {
                    ControllerScreen(state, viewModel)
                }
            }
        }
    }

    if (state.showConnectSheet) ConnectTvSheet(state, viewModel)
    if (state.showAppsSheet) AppsSheet(state, viewModel)
    if (state.showInputsSheet) InputsSheet(state, viewModel)
    if (state.showMoreSheet) MoreControlsSheet(state, viewModel)
    if (state.showSettingsSheet) SettingsSheet(state, viewModel)
    if (state.showPresetEditor) PresetEditorSheet(state, viewModel)

    if (confirmPowerOff) {
        AlertDialog(
            onDismissRequest = { confirmPowerOff = false },
            icon = { Icon(Icons.Rounded.PowerSettingsNew, contentDescription = null) },
            title = { Text(tr("Desligar a TV?")) },
            text = { Text(tr("Para ligar novamente pelo aplicativo, a TV precisa ter Mobile TV On/Wake-on-LAN ativado.")) },
            confirmButton = {
                Button(onClick = {
                    viewModel.send(RemoteAction.PowerOff)
                    confirmPowerOff = false
                }) { Text(tr("Desligar")) }
            },
            dismissButton = { TextButton(onClick = { confirmPowerOff = false }) { Text(tr("Cancelar")) } }
        )
    }
}

@Composable
private fun AppHeader(
    state: RemoteUiState,
    onDeviceClick: () -> Unit,
    onSettings: () -> Unit,
    onVoice: () -> Unit,
    onPower: () -> Unit,
    onReconnect: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.background.copy(alpha = 0.90f))
            .statusBarsPadding()
            .padding(horizontal = 16.dp, vertical = 8.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Surface(
                modifier = Modifier.size(44.dp),
                shape = RoundedCornerShape(15.dp),
                color = Color.Transparent
            ) {
                Box(
                    modifier = Modifier.background(
                        Brush.linearGradient(
                            listOf(MaterialTheme.colorScheme.primary, MaterialTheme.colorScheme.tertiary)
                        )
                    ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Rounded.Tv, contentDescription = null, tint = Color(0xFF06141C))
                }
            }
            Spacer(Modifier.width(11.dp))
            Column(
                Modifier
                    .weight(1f)
                    .clickable(onClick = onDeviceClick)
                    .padding(vertical = 3.dp)
            ) {
                Text(
                    state.currentDevice?.displayName ?: "Libre Remote",
                    fontWeight = FontWeight.Bold,
                    fontSize = 19.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        Modifier
                            .size(8.dp)
                            .background(connectionColor(state.connectionState), CircleShape)
                    )
                    Spacer(Modifier.width(6.dp))
                    Text(
                        localizeStatus(state.statusText, state.appLanguage),
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontSize = 11.5.sp,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }
            if (state.connectionState == ConnectionState.Error) {
                IconButton(onClick = onReconnect) {
                    Icon(Icons.Rounded.Refresh, contentDescription = tr("Reconectar"))
                }
            }
            IconButton(onClick = onVoice, enabled = state.connected) {
                Icon(
                    Icons.Rounded.Mic,
                    contentDescription = tr("Microfone"),
                    tint = if (state.connected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.45f)
                )
            }
            IconButton(onClick = onPower) {
                Icon(
                    Icons.Rounded.PowerSettingsNew,
                    contentDescription = if (state.connected) tr("Desligar TV") else tr("Ligar TV"),
                    tint = if (state.connected) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary
                )
            }
            IconButton(onClick = onSettings) {
                Icon(Icons.Rounded.Settings, contentDescription = tr("Configurações"))
            }
        }
        AnimatedVisibility(visible = state.busy) {
            Row(
                Modifier.fillMaxWidth().padding(top = 5.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                CircularProgressIndicator(Modifier.size(13.dp), strokeWidth = 2.dp)
                Spacer(Modifier.width(7.dp))
                Text(
                    if (state.connectionState == ConnectionState.Pairing) tr("Aceite o pedido mostrado na televisão") else localizeStatus(state.statusText, state.appLanguage),
                    fontSize = 11.dp.value.sp,
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}

@Composable
private fun WelcomeScreen(state: RemoteUiState, onConnect: () -> Unit, onDiagnose: () -> Unit) {
    Box(Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
            Box(
                Modifier
                    .size(116.dp)
                    .background(MaterialTheme.colorScheme.primaryContainer, RoundedCornerShape(36.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    Icons.Rounded.Tv,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(58.dp)
                )
            }
            Spacer(Modifier.height(24.dp))
            Text(tr("Seu controle, sem anúncios"), style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(8.dp))
            Text(
                tr("Conecte a TV uma vez. Nas próximas aberturas, o aplicativo tenta reconectar automaticamente."),
                textAlign = TextAlign.Center,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.fillMaxWidth(0.88f)
            )
            Spacer(Modifier.height(25.dp))
            Button(onClick = onConnect, modifier = Modifier.fillMaxWidth(0.82f).height(56.dp)) {
                Icon(Icons.Rounded.Search, contentDescription = null)
                Spacer(Modifier.width(9.dp))
                Text(tr("Conectar TV"), fontWeight = FontWeight.Bold)
            }
            Spacer(Modifier.height(10.dp))
            TextButton(onClick = onDiagnose) {
                Icon(Icons.Rounded.Wifi, contentDescription = null, Modifier.size(18.dp))
                Spacer(Modifier.width(7.dp))
                Text(tr("Verificar minha rede"))
            }
            if (state.connectionState == ConnectionState.PermissionRequired) {
                Spacer(Modifier.height(12.dp))
                Text(
                    tr("O acesso à rede local é necessário somente para localizar e controlar a TV."),
                    textAlign = TextAlign.Center,
                    color = MaterialTheme.colorScheme.error,
                    fontSize = 12.sp
                )
            }
        }
    }
}

@Composable
private fun ControllerScreen(state: RemoteUiState, viewModel: RemoteViewModel) {
    Column(Modifier.fillMaxSize()) {
        SurfaceSelector(
            selected = state.controlSurface,
            pointerAvailable = TvCapability.Pointer in state.capabilities,
            onSelect = viewModel::setControlSurface
        )
        AnimatedContent(
            targetState = state.controlSurface,
            label = "control-surface",
            modifier = Modifier.fillMaxSize()
        ) { surface ->
            when (surface) {
                ControlSurface.Remote -> RemotePresetContent(state, viewModel)
                ControlSurface.Touchpad -> LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(horizontal = 18.dp, vertical = 14.dp)
                ) {
                    item { TouchpadSurface(state, viewModel) }
                }
            }
        }
    }
}

@Composable
private fun SurfaceSelector(
    selected: ControlSurface,
    pointerAvailable: Boolean,
    onSelect: (ControlSurface) -> Unit
) {
    Row(
        Modifier.fillMaxWidth().padding(horizontal = 18.dp, vertical = 6.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Segment(
            modifier = Modifier.weight(1f),
            selected = selected == ControlSurface.Remote,
            icon = Icons.Rounded.Tv,
            label = tr("Controle"),
            onClick = { onSelect(ControlSurface.Remote) }
        )
        Segment(
            modifier = Modifier.weight(1f),
            selected = selected == ControlSurface.Touchpad,
            icon = Icons.Rounded.TouchApp,
            label = tr("Touchpad"),
            enabled = pointerAvailable,
            onClick = { onSelect(ControlSurface.Touchpad) }
        )
    }
}

@Composable
private fun Segment(
    modifier: Modifier,
    selected: Boolean,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    enabled: Boolean = true,
    onClick: () -> Unit
) {
    Surface(
        onClick = onClick,
        modifier = modifier.height(44.dp),
        enabled = enabled,
        shape = RoundedCornerShape(16.dp),
        color = if (selected) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant
    ) {
        Row(
            Modifier.padding(horizontal = 14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            Icon(icon, contentDescription = null, Modifier.size(19.dp))
            Spacer(Modifier.width(7.dp))
            Text(label, fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium)
        }
    }
}

@Composable
private fun RemotePresetContent(state: RemoteUiState, viewModel: RemoteViewModel) {
    if (state.selectedPresetId == RemotePresetId.AdvancedLegacy) {
        AdvancedLegacyPresetContent(state, viewModel)
        return
    }
    val preset = state.selectedPreset
    val modules = preset.modules.filter { module ->
        module.requiredCapability == null || module.requiredCapability in state.capabilities
    }
    BoxWithConstraints(Modifier.fillMaxSize()) {
        val wide = maxWidth >= 600.dp
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = if (wide) 30.dp else 18.dp, vertical = 10.dp),
            verticalArrangement = Arrangement.spacedBy(if (state.compactMode || preset.compact) 12.dp else 17.dp)
        ) {
            item {
                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text(preset.name, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Text(
                            if (state.connected) tr("Pronto para usar") else tr("Os botões serão ativados após a conexão"),
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            fontSize = 11.sp
                        )
                    }
                    Surface(
                        onClick = viewModel::openPresetEditor,
                        shape = RoundedCornerShape(14.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant
                    ) {
                        Row(Modifier.padding(horizontal = 11.dp, vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Rounded.MoreHoriz, contentDescription = null, Modifier.size(18.dp))
                            Spacer(Modifier.width(5.dp))
                            Text(tr("Editar"), fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                        }
                    }
                }
            }

            if (RemoteModule.DPad in modules && wide && RemoteModule.Volume in modules) {
                item {
                    Row(
                        Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RemoteDPad(
                            enabled = state.connected,
                            haptics = state.hapticsEnabled,
                            compact = true,
                            onAction = viewModel::send,
                            onDirectionPress = viewModel::startRepeating,
                            onDirectionRelease = viewModel::stopRepeating
                        )
                        Box(Modifier.width(260.dp)) {
                            VolumeAndChannelControls(
                                state,
                                viewModel,
                                includeChannels = RemoteModule.Channels in modules,
                                compact = state.compactMode
                            )
                        }
                    }
                }
            } else {
                if (RemoteModule.DPad in modules) {
                    item {
                        Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                            RemoteDPad(
                                enabled = state.connected,
                                haptics = state.hapticsEnabled,
                                compact = state.compactMode || preset.compact,
                                onAction = viewModel::send,
                                onDirectionPress = viewModel::startRepeating,
                                onDirectionRelease = viewModel::stopRepeating
                            )
                        }
                    }
                }
                if (RemoteModule.Volume in modules) {
                    item {
                        VolumeAndChannelControls(
                            state,
                            viewModel,
                            includeChannels = RemoteModule.Channels in modules,
                            compact = state.compactMode || preset.compact
                        )
                    }
                }
            }
            if (RemoteModule.CoreActions in modules) item { CoreActionRow(state, viewModel) }
            if (RemoteModule.Media in modules) item { MediaControls(state, viewModel) }
            if (
                RemoteModule.Apps in modules || RemoteModule.Inputs in modules ||
                RemoteModule.Keyboard in modules
            ) item { ShortcutRow(state, viewModel) }
            if (RemoteModule.Colors in modules) item { ColorButtons(state, viewModel) }
            if (RemoteModule.InfoMenu in modules) item { InfoMenuRow(state, viewModel) }
            if (RemoteModule.Numeric in modules) {
                item {
                    Surface(
                        onClick = viewModel::openMore,
                        modifier = Modifier.fillMaxWidth().height(52.dp),
                        shape = RoundedCornerShape(17.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text(tr("Abrir teclado numérico"), fontWeight = FontWeight.SemiBold)
                        }
                    }
                }
            }
            if (RemoteModule.TouchpadShortcut in modules && TvCapability.Pointer in state.capabilities) {
                item { TouchpadPresetShortcut(state, viewModel) }
            }
            item { Spacer(Modifier.height(14.dp)) }
        }
    }
}

@Composable
private fun AdvancedLegacyPresetContent(state: RemoteUiState, viewModel: RemoteViewModel) {
    val modules = state.selectedPreset.modules.filter { module ->
        module.requiredCapability == null || module.requiredCapability in state.capabilities
    }
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(horizontal = 18.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text(tr("Avançado AL"), fontWeight = FontWeight.Bold, fontSize = 18.sp)
                    Text(
                        tr("Tudo em um só controle • role do início ao fim"),
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontSize = 12.sp
                    )
                }
                Surface(
                    onClick = viewModel::openPresetEditor,
                    shape = RoundedCornerShape(14.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant
                ) {
                    Row(Modifier.padding(horizontal = 11.dp, vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Rounded.MoreHoriz, contentDescription = null, Modifier.size(18.dp))
                        Spacer(Modifier.width(5.dp))
                        Text(tr("Preset"), fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }

        item { AdvancedConnectionSection(state, viewModel) }

        if (RemoteModule.DPad in modules) {
            item {
                AdvancedSectionTitle(tr("Navegação"))
                Spacer(Modifier.height(8.dp))
                Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                    RemoteDPad(
                        enabled = state.connected,
                        haptics = state.hapticsEnabled,
                        compact = false,
                        onAction = viewModel::send,
                        onDirectionPress = viewModel::startRepeating,
                        onDirectionRelease = viewModel::stopRepeating
                    )
                }
            }
        }
        if (RemoteModule.CoreActions in modules || RemoteModule.Power in modules) {
            item {
                AdvancedSectionTitle(tr("Sistema"))
                Spacer(Modifier.height(8.dp))
                if (RemoteModule.CoreActions in modules) CoreActionRow(state, viewModel)
                if (RemoteModule.Power in modules) {
                    Spacer(Modifier.height(10.dp))
                    Surface(
                        onClick = { viewModel.send(RemoteAction.PowerOff) },
                        enabled = state.connected && TvCapability.PowerOff in state.capabilities,
                        modifier = Modifier.fillMaxWidth().height(52.dp),
                        shape = RoundedCornerShape(17.dp),
                        color = MaterialTheme.colorScheme.error.copy(alpha = 0.14f)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text(tr("Desligar TV"), color = MaterialTheme.colorScheme.error, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
        if (RemoteModule.Volume in modules) {
            item {
                AdvancedSectionTitle(tr("Volume e canais"))
                Spacer(Modifier.height(8.dp))
                VolumeAndChannelControls(
                    state = state,
                    viewModel = viewModel,
                    includeChannels = RemoteModule.Channels in modules,
                    compact = false
                )
            }
        }
        if (RemoteModule.Media in modules) {
            item {
                AdvancedSectionTitle(tr("Reprodução"))
                Spacer(Modifier.height(8.dp))
                MediaControls(state, viewModel)
            }
        }
        if (RemoteModule.TouchpadShortcut in modules && TvCapability.Pointer in state.capabilities) {
            item {
                AdvancedSectionTitle(tr("Mousepad / touchpad"))
                Spacer(Modifier.height(8.dp))
                TouchpadSurface(state, viewModel)
            }
        }
        if (RemoteModule.Inputs in modules) item { AdvancedInputsSection(state, viewModel) }
        if (RemoteModule.Apps in modules) item { AdvancedAppsSection(state, viewModel) }
        if (RemoteModule.Keyboard in modules) item { AdvancedKeyboardSection(state, viewModel) }
        if (RemoteModule.Numeric in modules) item { AdvancedNumericSection(state, viewModel) }
        if (RemoteModule.Colors in modules) {
            item {
                AdvancedSectionTitle(tr("Botões coloridos"))
                Spacer(Modifier.height(8.dp))
                ColorButtons(state, viewModel)
            }
        }
        if (RemoteModule.InfoMenu in modules) {
            item {
                AdvancedSectionTitle(tr("Info e ajustes da TV"))
                Spacer(Modifier.height(8.dp))
                InfoMenuRow(state, viewModel)
            }
        }
        item { Spacer(Modifier.height(24.dp)) }
    }
}

@Composable
private fun AdvancedConnectionSection(state: RemoteUiState, viewModel: RemoteViewModel) {
    var ip by rememberSaveable(state.currentDevice?.stableId) { mutableStateOf(state.currentDevice?.ip.orEmpty()) }
    var mac by rememberSaveable(state.currentDevice?.stableId) { mutableStateOf(state.currentDevice?.mac.orEmpty()) }
    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        shape = RoundedCornerShape(24.dp)
    ) {
        Column(Modifier.fillMaxWidth().padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            AdvancedSectionTitle(tr("Conexão"))
            Text(
                localizeStatus(state.statusText, state.appLanguage),
                color = if (state.connectionState == ConnectionState.Error) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurfaceVariant,
                fontSize = 12.sp
            )
            OutlinedTextField(
                value = ip,
                onValueChange = { ip = it },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                label = { Text(tr("IP / endereço local da TV")) },
                placeholder = { Text(tr("192.168.1.20")) }
            )
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(
                    onClick = { viewModel.connectManual(ip) },
                    modifier = Modifier.weight(1f),
                    enabled = ip.isNotBlank() && !state.busy
                ) { Text(tr("Conectar")) }
                Button(
                    onClick = viewModel::openConnect,
                    modifier = Modifier.weight(1f),
                    enabled = !state.busy
                ) { Text(tr("Buscar TVs")) }
            }
            if (state.currentDevice != null) {
                Surface(
                    onClick = viewModel::reconnect,
                    modifier = Modifier.fillMaxWidth().height(46.dp),
                    shape = RoundedCornerShape(15.dp),
                    color = MaterialTheme.colorScheme.primaryContainer
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text("Reconectar ${state.currentDevice.displayName}", fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                    }
                }
            }
            OutlinedTextField(
                value = mac,
                onValueChange = { mac = it },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                label = { Text(tr("MAC para ligar por Wi‑Fi")) },
                placeholder = { Text(tr("AA:BB:CC:DD:EE:FF")) }
            )
            Surface(
                onClick = { viewModel.wake(macOverride = mac) },
                enabled = state.currentDevice != null && mac.isNotBlank(),
                modifier = Modifier.fillMaxWidth().height(46.dp),
                shape = RoundedCornerShape(15.dp),
                color = MaterialTheme.colorScheme.surface
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Text(tr("Ligar TV (Wake-on-LAN)"), fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                }
            }
        }
    }
}

@Composable
private fun AdvancedInputsSection(state: RemoteUiState, viewModel: RemoteViewModel) {
    val inputs = state.inputs.ifEmpty {
        listOf(TvInput("HDMI_1", "HDMI 1"), TvInput("HDMI_2", "HDMI 2"), TvInput("HDMI_3", "HDMI 3"))
    }
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        AdvancedSectionTitle(tr("Entradas"))
        inputs.chunked(3).forEach { rowInputs ->
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                rowInputs.forEach { input ->
                    Surface(
                        onClick = { viewModel.switchInput(input) },
                        enabled = state.connected && input.connected,
                        modifier = Modifier.weight(1f).height(48.dp),
                        shape = RoundedCornerShape(15.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text(input.label, fontWeight = FontWeight.SemiBold, fontSize = 12.sp, maxLines = 1)
                        }
                    }
                }
                repeat(3 - rowInputs.size) { Spacer(Modifier.weight(1f)) }
            }
        }
    }
}

@Composable
private fun AdvancedAppsSection(state: RemoteUiState, viewModel: RemoteViewModel) {
    val apps = state.apps.take(8)
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        AdvancedSectionTitle(tr("Aplicativos"))
        if (apps.isEmpty()) {
            Surface(
                onClick = viewModel::refresh,
                enabled = state.connected,
                modifier = Modifier.fillMaxWidth().height(48.dp),
                shape = RoundedCornerShape(15.dp),
                color = MaterialTheme.colorScheme.surfaceVariant
            ) { Box(contentAlignment = Alignment.Center) { Text(tr("Carregar aplicativos"), fontWeight = FontWeight.SemiBold) } }
        } else {
            apps.chunked(2).forEach { rowApps ->
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    rowApps.forEach { app ->
                        Surface(
                            onClick = { viewModel.launchApp(app) },
                            enabled = state.connected,
                            modifier = Modifier.weight(1f).height(50.dp),
                            shape = RoundedCornerShape(15.dp),
                            color = MaterialTheme.colorScheme.surfaceVariant
                        ) {
                            Box(Modifier.padding(horizontal = 10.dp), contentAlignment = Alignment.Center) {
                                Text(app.title, fontWeight = FontWeight.SemiBold, fontSize = 12.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                            }
                        }
                    }
                    if (rowApps.size == 1) Spacer(Modifier.weight(1f))
                }
            }
            TextButton(onClick = viewModel::openApps, enabled = state.connected, modifier = Modifier.fillMaxWidth()) {
                Text(tr("Ver todos os aplicativos"))
            }
        }
    }
}

@Composable
private fun AdvancedKeyboardSection(state: RemoteUiState, viewModel: RemoteViewModel) {
    var text by rememberSaveable { mutableStateOf("") }
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        AdvancedSectionTitle(tr("Digitar na TV"))
        OutlinedTextField(
            value = text,
            onValueChange = { text = it },
            modifier = Modifier.fillMaxWidth(),
            enabled = state.connected,
            singleLine = true,
            label = { Text(tr("Texto")) }
        )
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(
                onClick = { if (text.isNotBlank()) { viewModel.sendText(text); text = "" } },
                enabled = state.connected && text.isNotBlank(),
                modifier = Modifier.weight(1f)
            ) { Text(tr("Enviar")) }
            Button(onClick = viewModel::deleteText, enabled = state.connected, modifier = Modifier.weight(1f)) { Text(tr("Apagar")) }
        }
    }
}

@Composable
private fun AdvancedNumericSection(state: RemoteUiState, viewModel: RemoteViewModel) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        AdvancedSectionTitle(tr("Teclado numérico"))
        (1..9).chunked(3).forEach { numbers ->
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                numbers.forEach { number ->
                    PressControl(
                        text = number.toString(),
                        contentDescription = "Número $number",
                        size = 54.dp,
                        enabled = state.connected,
                        haptics = state.hapticsEnabled,
                        showLabel = false,
                        onPress = { viewModel.sendNumber(number) }
                    )
                }
            }
        }
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.Center) {
            PressControl(
                text = "0",
                contentDescription = "Número zero",
                size = 54.dp,
                enabled = state.connected,
                haptics = state.hapticsEnabled,
                showLabel = false,
                onPress = { viewModel.sendNumber(0) }
            )
        }
    }
}

@Composable
private fun AdvancedSectionTitle(text: String) {
    Text(text, fontWeight = FontWeight.Bold, fontSize = 15.sp)
}

@Composable
private fun TouchpadPresetShortcut(state: RemoteUiState, viewModel: RemoteViewModel) {
    Surface(
        onClick = { viewModel.setControlSurface(ControlSurface.Touchpad) },
        enabled = state.connected && TvCapability.Pointer in state.capabilities,
        modifier = Modifier.fillMaxWidth().height(58.dp),
        shape = RoundedCornerShape(18.dp),
        color = MaterialTheme.colorScheme.primaryContainer
    ) {
        Row(
            Modifier.padding(horizontal = 16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            Icon(Icons.Rounded.TouchApp, contentDescription = null)
            Spacer(Modifier.width(8.dp))
            Text(tr("Abrir mousepad / touchpad"), fontWeight = FontWeight.Bold)
        }
    }
}

private fun connectionColor(state: ConnectionState): Color = when (state) {
    ConnectionState.Connected -> Color(0xFF42D392)
    ConnectionState.Error -> Color(0xFFFF6B6B)
    ConnectionState.Pairing, ConnectionState.Connecting, ConnectionState.Reconnecting, ConnectionState.Discovering -> Color(0xFFFFC857)
    else -> Color(0xFF8391A1)
}
