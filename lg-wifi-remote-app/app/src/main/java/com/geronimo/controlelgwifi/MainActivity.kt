package com.geronimo.controlelgwifi

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
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
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
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
                LibreRemoteApp(state, remoteViewModel)
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

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = MaterialTheme.colorScheme.background,
        topBar = {
            AppHeader(
                state = state,
                onDeviceClick = openConnect,
                onSettings = viewModel::openSettings,
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
            title = { Text("Desligar a TV?") },
            text = { Text("Para ligar novamente pelo aplicativo, a TV precisa ter Mobile TV On/Wake-on-LAN ativado.") },
            confirmButton = {
                Button(onClick = {
                    viewModel.send(RemoteAction.PowerOff)
                    confirmPowerOff = false
                }) { Text("Desligar") }
            },
            dismissButton = { TextButton(onClick = { confirmPowerOff = false }) { Text("Cancelar") } }
        )
    }
}

@Composable
private fun AppHeader(
    state: RemoteUiState,
    onDeviceClick: () -> Unit,
    onSettings: () -> Unit,
    onPower: () -> Unit,
    onReconnect: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.background)
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
                        state.statusText,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontSize = 11.5.sp,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }
            if (state.connectionState == ConnectionState.Error) {
                IconButton(onClick = onReconnect) {
                    Icon(Icons.Rounded.Refresh, contentDescription = "Reconectar")
                }
            }
            IconButton(onClick = onPower) {
                Icon(
                    Icons.Rounded.PowerSettingsNew,
                    contentDescription = if (state.connected) "Desligar TV" else "Ligar TV",
                    tint = if (state.connected) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary
                )
            }
            IconButton(onClick = onSettings) {
                Icon(Icons.Rounded.Settings, contentDescription = "Configurações")
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
                    if (state.connectionState == ConnectionState.Pairing) "Aceite o pedido mostrado na televisão" else state.statusText,
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
            Text("Seu controle, sem anúncios", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(8.dp))
            Text(
                "Conecte a TV uma vez. Nas próximas aberturas, o aplicativo tenta reconectar automaticamente.",
                textAlign = TextAlign.Center,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.fillMaxWidth(0.88f)
            )
            Spacer(Modifier.height(25.dp))
            Button(onClick = onConnect, modifier = Modifier.fillMaxWidth(0.82f).height(56.dp)) {
                Icon(Icons.Rounded.Search, contentDescription = null)
                Spacer(Modifier.width(9.dp))
                Text("Conectar TV", fontWeight = FontWeight.Bold)
            }
            Spacer(Modifier.height(10.dp))
            TextButton(onClick = onDiagnose) {
                Icon(Icons.Rounded.Wifi, contentDescription = null, Modifier.size(18.dp))
                Spacer(Modifier.width(7.dp))
                Text("Verificar minha rede")
            }
            if (state.connectionState == ConnectionState.PermissionRequired) {
                Spacer(Modifier.height(12.dp))
                Text(
                    "O acesso à rede local é necessário somente para localizar e controlar a TV.",
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
            label = "Controle",
            onClick = { onSelect(ControlSurface.Remote) }
        )
        Segment(
            modifier = Modifier.weight(1f),
            selected = selected == ControlSurface.Touchpad,
            icon = Icons.Rounded.TouchApp,
            label = "Touchpad",
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
                            if (state.connected) "Pronto para usar" else "Os botões serão ativados após a conexão",
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
                            Text("Editar", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
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
                            onAction = viewModel::send
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
                                onAction = viewModel::send
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
                            Text("Abrir teclado numérico", fontWeight = FontWeight.SemiBold)
                        }
                    }
                }
            }
            item { Spacer(Modifier.height(14.dp)) }
        }
    }
}

private fun connectionColor(state: ConnectionState): Color = when (state) {
    ConnectionState.Connected -> Color(0xFF42D392)
    ConnectionState.Error -> Color(0xFFFF6B6B)
    ConnectionState.Pairing, ConnectionState.Connecting, ConnectionState.Reconnecting, ConnectionState.Discovering -> Color(0xFFFFC857)
    else -> Color(0xFF8391A1)
}
