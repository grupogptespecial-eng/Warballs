package com.geronimo.controlelgwifi

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.gestures.waitForUpOrCancellation
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material.icons.automirrored.rounded.VolumeDown
import androidx.compose.material.icons.automirrored.rounded.VolumeUp
import androidx.compose.material.icons.rounded.Apps
import androidx.compose.material.icons.rounded.ArrowBack
import androidx.compose.material.icons.rounded.ArrowDownward
import androidx.compose.material.icons.rounded.ArrowForward
import androidx.compose.material.icons.rounded.ArrowUpward
import androidx.compose.material.icons.rounded.Backspace
import androidx.compose.material.icons.rounded.CastConnected
import androidx.compose.material.icons.rounded.Circle
import androidx.compose.material.icons.rounded.ColorLens
import androidx.compose.material.icons.rounded.FastForward
import androidx.compose.material.icons.rounded.Home
import androidx.compose.material.icons.rounded.Info
import androidx.compose.material.icons.rounded.Keyboard
import androidx.compose.material.icons.rounded.KeyboardArrowDown
import androidx.compose.material.icons.rounded.KeyboardArrowUp
import androidx.compose.material.icons.rounded.Menu
import androidx.compose.material.icons.rounded.MoreVert
import androidx.compose.material.icons.rounded.Pause
import androidx.compose.material.icons.rounded.PlayArrow
import androidx.compose.material.icons.rounded.PowerSettingsNew
import androidx.compose.material.icons.rounded.Refresh
import androidx.compose.material.icons.rounded.Replay
import androidx.compose.material.icons.rounded.Search
import androidx.compose.material.icons.rounded.Settings
import androidx.compose.material.icons.rounded.SkipNext
import androidx.compose.material.icons.rounded.Stop
import androidx.compose.material.icons.rounded.TouchApp
import androidx.compose.material.icons.rounded.Tv
import androidx.compose.material.icons.rounded.VolumeOff
import androidx.compose.material.icons.rounded.Wifi
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilledIconButton
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlin.math.abs
import kotlin.math.roundToInt

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            LibreRemoteTheme {
                val remoteViewModel: RemoteViewModel = viewModel()
                LibreRemoteApp(remoteViewModel)
            }
        }
    }
}

private val DarkColors = darkColorScheme(
    primary = Color(0xFF8BD5FF),
    onPrimary = Color(0xFF00344B),
    primaryContainer = Color(0xFF164C66),
    onPrimaryContainer = Color(0xFFC9EAFF),
    secondary = Color(0xFFC0C8D1),
    secondaryContainer = Color(0xFF303842),
    tertiary = Color(0xFFD8B9FF),
    background = Color(0xFF0B0E12),
    surface = Color(0xFF11151B),
    surfaceVariant = Color(0xFF1B212A),
    outline = Color(0xFF77818D),
    error = Color(0xFFFFB4AB)
)

private val LightColors = lightColorScheme(
    primary = Color(0xFF00658A),
    onPrimary = Color.White,
    primaryContainer = Color(0xFFC4E7FF),
    onPrimaryContainer = Color(0xFF001E2C),
    secondaryContainer = Color(0xFFDCE3EC),
    background = Color(0xFFF7F9FC),
    surface = Color.White,
    surfaceVariant = Color(0xFFE8EDF3)
)

@Composable
private fun LibreRemoteTheme(content: @Composable () -> Unit) {
    val dark = androidx.compose.foundation.isSystemInDarkTheme()
    MaterialTheme(
        colorScheme = if (dark) DarkColors else LightColors,
        typography = androidx.compose.material3.Typography(),
        content = content
    )
}

private enum class MainTab(val label: String, val icon: ImageVector) {
    Remote("Controle", Icons.Rounded.Tv),
    Touchpad("Touchpad", Icons.Rounded.TouchApp),
    Apps("Apps", Icons.Rounded.Apps),
    Settings("Ajustes", Icons.Rounded.Settings)
}

@Composable
private fun LibreRemoteApp(viewModel: RemoteViewModel) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    var selectedTab by rememberSaveable { mutableStateOf(MainTab.Remote) }

    if (state.showDevicePicker) {
        DevicePickerDialog(
            devices = state.discoveredDevices,
            onSelect = viewModel::connect,
            onDismiss = viewModel::dismissDevicePicker
        )
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = MaterialTheme.colorScheme.background,
        topBar = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.background)
                    .statusBarsPadding()
                    .padding(horizontal = 18.dp, vertical = 10.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(
                                Brush.linearGradient(
                                    listOf(MaterialTheme.colorScheme.primary, MaterialTheme.colorScheme.tertiary)
                                )
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Rounded.Tv, contentDescription = null, tint = Color(0xFF07131A))
                    }
                    Spacer(Modifier.width(12.dp))
                    Column(Modifier.weight(1f)) {
                        Text("Libre Remote", fontWeight = FontWeight.Bold, fontSize = 21.sp)
                        Text(
                            "Livre, local e sem anúncios",
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            fontSize = 12.sp
                        )
                    }
                    IconButton(onClick = viewModel::refresh, enabled = state.connectionState == ConnectionState.Connected) {
                        Icon(Icons.Rounded.Refresh, contentDescription = "Atualizar dados da TV")
                    }
                }
                Spacer(Modifier.height(10.dp))
                ConnectionCard(state = state, onReconnect = viewModel::reconnect, onDiscover = viewModel::discover)
            }
        },
        bottomBar = {
            NavigationBar(
                modifier = Modifier.navigationBarsPadding(),
                containerColor = MaterialTheme.colorScheme.surface
            ) {
                MainTab.entries.forEach { tab ->
                    NavigationBarItem(
                        selected = selectedTab == tab,
                        onClick = { selectedTab = tab },
                        icon = { Icon(tab.icon, contentDescription = null) },
                        label = { Text(tab.label) }
                    )
                }
            }
        }
    ) { padding ->
        AnimatedContent(
            targetState = selectedTab,
            label = "main-tab",
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) { tab ->
            when (tab) {
                MainTab.Remote -> RemoteScreen(state, viewModel)
                MainTab.Touchpad -> TouchpadScreen(state, viewModel)
                MainTab.Apps -> AppsScreen(state, viewModel)
                MainTab.Settings -> SettingsScreen(state, viewModel)
            }
        }
    }
}

@Composable
private fun ConnectionCard(
    state: RemoteUiState,
    onReconnect: () -> Unit,
    onDiscover: () -> Unit
) {
    val connected = state.connectionState == ConnectionState.Connected
    val busy = state.connectionState in setOf(ConnectionState.Connecting, ConnectionState.Pairing, ConnectionState.Discovering)
    Card(
        colors = CardDefaults.cardColors(
            containerColor = if (connected) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant
        ),
        shape = RoundedCornerShape(22.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 13.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(11.dp)
                    .clip(CircleShape)
                    .background(
                        when {
                            connected -> Color(0xFF55D98B)
                            state.connectionState == ConnectionState.Error -> MaterialTheme.colorScheme.error
                            else -> MaterialTheme.colorScheme.outline
                        }
                    )
            )
            Spacer(Modifier.width(11.dp))
            Column(Modifier.weight(1f)) {
                Text(
                    state.currentDevice?.name ?: "Nenhuma TV selecionada",
                    fontWeight = FontWeight.SemiBold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    state.statusText,
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 2
                )
            }
            if (busy) {
                CircularProgressIndicator(modifier = Modifier.size(23.dp), strokeWidth = 2.5.dp)
            } else {
                IconButton(onClick = if (state.currentDevice != null) onReconnect else onDiscover) {
                    Icon(if (state.currentDevice != null) Icons.Rounded.Refresh else Icons.Rounded.Search, contentDescription = "Conectar")
                }
            }
        }
    }
}

@Composable
private fun RemoteScreen(state: RemoteUiState, viewModel: RemoteViewModel) {
    val enabled = state.connectionState == ConnectionState.Connected
    var showKeypad by rememberSaveable { mutableStateOf(false) }
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .imePadding(),
        contentPadding = PaddingValues(horizontal = 18.dp, vertical = 14.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Controle remoto", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                PressIconButton(
                    icon = Icons.Rounded.PowerSettingsNew,
                    label = "Desligar TV",
                    enabled = enabled,
                    danger = true,
                    size = 58.dp,
                    haptics = state.hapticsEnabled,
                    onPress = { viewModel.send(RemoteAction.PowerOff) }
                )
            }
        }

        item {
            DPad(
                enabled = enabled,
                haptics = state.hapticsEnabled,
                onPress = viewModel::send
            )
        }

        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                VerticalControlPill(
                    modifier = Modifier.weight(1f),
                    title = "VOLUME",
                    topIcon = Icons.AutoMirrored.Rounded.VolumeUp,
                    bottomIcon = Icons.AutoMirrored.Rounded.VolumeDown,
                    centerIcon = if (state.muted) Icons.Rounded.VolumeOff else Icons.Rounded.Circle,
                    centerLabel = state.volume?.toString() ?: if (state.muted) "Mudo" else "Som",
                    enabled = enabled,
                    haptics = state.hapticsEnabled,
                    onTopStart = { viewModel.startRepeating(RemoteAction.VolumeUp) },
                    onTopStop = { viewModel.stopRepeating(RemoteAction.VolumeUp) },
                    onBottomStart = { viewModel.startRepeating(RemoteAction.VolumeDown) },
                    onBottomStop = { viewModel.stopRepeating(RemoteAction.VolumeDown) },
                    onCenter = { viewModel.send(RemoteAction.Mute) }
                )
                VerticalControlPill(
                    modifier = Modifier.weight(1f),
                    title = "CANAIS",
                    topIcon = Icons.Rounded.KeyboardArrowUp,
                    bottomIcon = Icons.Rounded.KeyboardArrowDown,
                    centerIcon = Icons.Rounded.Keyboard,
                    centerLabel = "Teclado",
                    enabled = enabled,
                    haptics = state.hapticsEnabled,
                    onTopStart = { viewModel.startRepeating(RemoteAction.ChannelUp) },
                    onTopStop = { viewModel.stopRepeating(RemoteAction.ChannelUp) },
                    onBottomStart = { viewModel.startRepeating(RemoteAction.ChannelDown) },
                    onBottomStop = { viewModel.stopRepeating(RemoteAction.ChannelDown) },
                    onCenter = { showKeypad = !showKeypad }
                )
            }
        }

        item {
            QuickActionRow(state, viewModel)
        }

        item {
            MediaControls(state, viewModel)
        }

        item {
            AnimatedVisibility(showKeypad) {
                NumberPad(
                    enabled = enabled,
                    haptics = state.hapticsEnabled,
                    onNumber = viewModel::sendNumber,
                    onColor = viewModel::sendColor
                )
            }
        }
    }
}

@Composable
private fun DPad(
    enabled: Boolean,
    haptics: Boolean,
    onPress: (RemoteAction) -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(270.dp),
        contentAlignment = Alignment.Center
    ) {
        Box(
            modifier = Modifier
                .size(254.dp)
                .clip(CircleShape)
                .background(MaterialTheme.colorScheme.surfaceVariant)
                .border(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.24f), CircleShape)
        )
        PressIconButton(
            modifier = Modifier.align(Alignment.TopCenter).padding(top = 12.dp),
            icon = Icons.Rounded.ArrowUpward,
            label = "Cima",
            enabled = enabled,
            haptics = haptics,
            onPress = { onPress(RemoteAction.Up) }
        )
        PressIconButton(
            modifier = Modifier.align(Alignment.BottomCenter).padding(bottom = 12.dp),
            icon = Icons.Rounded.ArrowDownward,
            label = "Baixo",
            enabled = enabled,
            haptics = haptics,
            onPress = { onPress(RemoteAction.Down) }
        )
        PressIconButton(
            modifier = Modifier.align(Alignment.CenterStart).padding(start = 25.dp),
            icon = Icons.Rounded.ArrowBack,
            label = "Esquerda",
            enabled = enabled,
            haptics = haptics,
            onPress = { onPress(RemoteAction.Left) }
        )
        PressIconButton(
            modifier = Modifier.align(Alignment.CenterEnd).padding(end = 25.dp),
            icon = Icons.Rounded.ArrowForward,
            label = "Direita",
            enabled = enabled,
            haptics = haptics,
            onPress = { onPress(RemoteAction.Right) }
        )
        PressTextButton(
            text = "OK",
            label = "Confirmar",
            enabled = enabled,
            haptics = haptics,
            size = 82.dp,
            primary = true,
            onPress = { onPress(RemoteAction.Enter) }
        )
    }
}

@Composable
private fun QuickActionRow(state: RemoteUiState, viewModel: RemoteViewModel) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        QuickAction(
            modifier = Modifier.weight(1f),
            icon = Icons.AutoMirrored.Rounded.ArrowBack,
            text = "Voltar",
            enabled = state.connectionState == ConnectionState.Connected,
            haptics = state.hapticsEnabled,
            onPress = { viewModel.send(RemoteAction.Back) }
        )
        QuickAction(
            modifier = Modifier.weight(1f),
            icon = Icons.Rounded.Home,
            text = "Home",
            enabled = state.connectionState == ConnectionState.Connected,
            haptics = state.hapticsEnabled,
            onPress = { viewModel.send(RemoteAction.Home) }
        )
        QuickAction(
            modifier = Modifier.weight(1f),
            icon = Icons.Rounded.Menu,
            text = "Menu",
            enabled = state.connectionState == ConnectionState.Connected,
            haptics = state.hapticsEnabled,
            onPress = { viewModel.send(RemoteAction.Menu) }
        )
        QuickAction(
            modifier = Modifier.weight(1f),
            icon = Icons.Rounded.Info,
            text = "Info",
            enabled = state.connectionState == ConnectionState.Connected,
            haptics = state.hapticsEnabled,
            onPress = { viewModel.send(RemoteAction.Info) }
        )
    }
}

@Composable
private fun MediaControls(state: RemoteUiState, viewModel: RemoteViewModel) {
    Card(shape = RoundedCornerShape(28.dp), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(12.dp),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            listOf(
                Icons.Rounded.Replay to RemoteAction.Rewind,
                Icons.Rounded.PlayArrow to RemoteAction.Play,
                Icons.Rounded.Pause to RemoteAction.Pause,
                Icons.Rounded.Stop to RemoteAction.Stop,
                Icons.Rounded.FastForward to RemoteAction.FastForward
            ).forEach { (icon, action) ->
                PressIconButton(
                    icon = icon,
                    label = action.name,
                    enabled = state.connectionState == ConnectionState.Connected,
                    size = if (action == RemoteAction.Play) 54.dp else 46.dp,
                    primary = action == RemoteAction.Play,
                    haptics = state.hapticsEnabled,
                    onPress = { viewModel.send(action) }
                )
            }
        }
    }
}

@Composable
private fun NumberPad(
    enabled: Boolean,
    haptics: Boolean,
    onNumber: (Int) -> Unit,
    onColor: (String) -> Unit
) {
    Card(shape = RoundedCornerShape(28.dp), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text("Teclado numérico", fontWeight = FontWeight.SemiBold)
            (1..9).chunked(3).forEach { row ->
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    row.forEach { number ->
                        PressTextButton(
                            modifier = Modifier.weight(1f),
                            text = number.toString(),
                            label = "Número $number",
                            enabled = enabled,
                            haptics = haptics,
                            size = 56.dp,
                            onPress = { onNumber(number) }
                        )
                    }
                }
            }
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.Center) {
                PressTextButton(
                    text = "0",
                    label = "Número zero",
                    enabled = enabled,
                    haptics = haptics,
                    size = 56.dp,
                    onPress = { onNumber(0) }
                )
            }
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                ColorButton(Color(0xFFE74C3C), "RED", enabled, haptics, onColor)
                ColorButton(Color(0xFF2ECC71), "GREEN", enabled, haptics, onColor)
                ColorButton(Color(0xFFF1C40F), "YELLOW", enabled, haptics, onColor)
                ColorButton(Color(0xFF3498DB), "BLUE", enabled, haptics, onColor)
            }
        }
    }
}

@Composable
private fun ColorButton(color: Color, name: String, enabled: Boolean, haptics: Boolean, onColor: (String) -> Unit) {
    PressTextButton(
        text = "",
        label = name,
        enabled = enabled,
        haptics = haptics,
        size = 43.dp,
        customColor = color,
        onPress = { onColor(name) }
    )
}

@Composable
private fun TouchpadScreen(state: RemoteUiState, viewModel: RemoteViewModel) {
    var keyboardText by rememberSaveable { mutableStateOf("") }
    var totalDrag by remember { mutableStateOf(0f) }
    val enabled = state.connectionState == ConnectionState.Connected

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 18.dp, vertical = 14.dp)
            .imePadding(),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Text("Touchpad", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        Text(
            "Deslize para mover o cursor, toque para clicar e use a faixa lateral para rolar.",
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            fontSize = 13.sp
        )

        Row(
            modifier = Modifier.weight(1f),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxHeight()
                    .clip(RoundedCornerShape(32.dp))
                    .background(
                        Brush.verticalGradient(
                            listOf(MaterialTheme.colorScheme.surfaceVariant, MaterialTheme.colorScheme.surface)
                        )
                    )
                    .border(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.22f), RoundedCornerShape(32.dp))
                    .pointerInput(enabled) {
                        if (!enabled) return@pointerInput
                        detectDragGestures(
                            onDragStart = { totalDrag = 0f },
                            onDragEnd = {
                                if (totalDrag < 8f) viewModel.clickPointer()
                                totalDrag = 0f
                            }
                        ) { change, amount ->
                            change.consume()
                            totalDrag += abs(amount.x) + abs(amount.y)
                            viewModel.movePointer((amount.x * 1.55f).roundToInt(), (amount.y * 1.55f).roundToInt())
                        }
                    }
                    .pointerInput(enabled) {
                        if (!enabled) return@pointerInput
                        detectTapGestures(onTap = { viewModel.clickPointer() })
                    },
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Rounded.TouchApp, contentDescription = null, modifier = Modifier.size(58.dp), tint = MaterialTheme.colorScheme.primary)
                    Spacer(Modifier.height(14.dp))
                    Text(if (enabled) "Toque ou deslize" else "Conecte uma TV", fontWeight = FontWeight.Medium)
                }
            }

            Box(
                modifier = Modifier
                    .width(52.dp)
                    .fillMaxHeight()
                    .clip(RoundedCornerShape(26.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant)
                    .pointerInput(enabled) {
                        if (!enabled) return@pointerInput
                        detectDragGestures { change, amount ->
                            change.consume()
                            viewModel.scrollPointer((amount.y * 2f).roundToInt())
                        }
                    },
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Rounded.KeyboardArrowUp, contentDescription = null)
                    Spacer(Modifier.weight(1f))
                    Text("ROLAR", fontSize = 9.sp, modifier = Modifier.padding(vertical = 8.dp))
                    Spacer(Modifier.weight(1f))
                    Icon(Icons.Rounded.KeyboardArrowDown, contentDescription = null)
                }
            }
        }

        Row(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) {
            OutlinedTextField(
                value = keyboardText,
                onValueChange = { keyboardText = it },
                modifier = Modifier.weight(1f),
                enabled = enabled,
                singleLine = true,
                label = { Text("Digitar na TV") },
                leadingIcon = { Icon(Icons.Rounded.Keyboard, contentDescription = null) }
            )
            FilledIconButton(
                onClick = {
                    if (keyboardText.isNotBlank()) {
                        viewModel.sendText(keyboardText)
                        keyboardText = ""
                    }
                },
                enabled = enabled && keyboardText.isNotBlank(),
                modifier = Modifier.size(54.dp)
            ) {
                Icon(Icons.Rounded.ArrowForward, contentDescription = "Enviar texto")
            }
            FilledIconButton(onClick = viewModel::deleteText, enabled = enabled, modifier = Modifier.size(54.dp)) {
                Icon(Icons.Rounded.Backspace, contentDescription = "Apagar um caractere")
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun AppsScreen(state: RemoteUiState, viewModel: RemoteViewModel) {
    var search by rememberSaveable { mutableStateOf("") }
    val filteredApps = remember(state.apps, search) {
        state.apps.filter { it.title.contains(search, ignoreCase = true) }
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(horizontal = 18.dp, vertical = 14.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Text("Apps e entradas", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        }
        item {
            Text("Entradas", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(8.dp))
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                val inputs = state.inputs.ifEmpty {
                    listOf(TvInput("HDMI_1", "HDMI 1"), TvInput("HDMI_2", "HDMI 2"), TvInput("HDMI_3", "HDMI 3"))
                }
                inputs.forEach { input ->
                    FilledTonalButton(
                        onClick = { viewModel.switchInput(input) },
                        enabled = state.connectionState == ConnectionState.Connected && input.connected,
                        shape = RoundedCornerShape(16.dp)
                    ) {
                        Icon(Icons.Rounded.CastConnected, contentDescription = null)
                        Spacer(Modifier.width(7.dp))
                        Text(input.label)
                    }
                }
            }
        }
        item {
            OutlinedTextField(
                value = search,
                onValueChange = { search = it },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                label = { Text("Procurar aplicativo") },
                leadingIcon = { Icon(Icons.Rounded.Search, contentDescription = null) }
            )
        }
        if (state.apps.isEmpty()) {
            item {
                EmptyAppsCard(
                    connected = state.connectionState == ConnectionState.Connected,
                    onRefresh = viewModel::refresh
                )
            }
        } else {
            items(filteredApps, key = { it.id }) { app ->
                AppRow(app = app, onClick = { viewModel.launchApp(app) })
            }
        }
    }
}

@Composable
private fun AppRow(app: TvApp, onClick: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
    ) {
        Row(Modifier.fillMaxWidth().padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier.size(46.dp).clip(RoundedCornerShape(14.dp)).background(MaterialTheme.colorScheme.primaryContainer),
                contentAlignment = Alignment.Center
            ) {
                Text(app.title.take(1).uppercase(), fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onPrimaryContainer)
            }
            Spacer(Modifier.width(13.dp))
            Text(app.title, modifier = Modifier.weight(1f), fontWeight = FontWeight.Medium)
            Icon(Icons.Rounded.ArrowForward, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
private fun EmptyAppsCard(connected: Boolean, onRefresh: () -> Unit) {
    Card(shape = RoundedCornerShape(24.dp), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)) {
        Column(Modifier.fillMaxWidth().padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(Icons.Rounded.Apps, contentDescription = null, modifier = Modifier.size(46.dp), tint = MaterialTheme.colorScheme.primary)
            Spacer(Modifier.height(10.dp))
            Text(if (connected) "Carregando aplicativos da TV" else "Conecte uma TV para ver os aplicativos", textAlign = TextAlign.Center)
            if (connected) {
                Spacer(Modifier.height(10.dp))
                TextButton(onClick = onRefresh) { Text("Tentar novamente") }
            }
        }
    }
}

@Composable
private fun SettingsScreen(state: RemoteUiState, viewModel: RemoteViewModel) {
    var ip by rememberSaveable { mutableStateOf(viewModel.savedIp) }
    var mac by rememberSaveable { mutableStateOf(viewModel.savedMac) }

    LazyColumn(
        modifier = Modifier.fillMaxSize().imePadding(),
        contentPadding = PaddingValues(horizontal = 18.dp, vertical = 14.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item { Text("Ajustes", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold) }
        item {
            SettingsCard("Conexão", Icons.Rounded.Wifi) {
                OutlinedTextField(
                    value = ip,
                    onValueChange = { ip = it },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    label = { Text("IP da TV") },
                    placeholder = { Text("192.168.1.20") }
                )
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Button(
                        onClick = { viewModel.connectManual(ip) },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(16.dp)
                    ) { Text("Conectar") }
                    OutlinedButton(
                        onClick = viewModel::discover,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(16.dp)
                    ) {
                        Icon(Icons.Rounded.Search, contentDescription = null)
                        Spacer(Modifier.width(6.dp))
                        Text("Buscar")
                    }
                }
            }
        }
        item {
            SettingsCard("Ligar por Wi-Fi", Icons.Rounded.PowerSettingsNew) {
                Text(
                    "Ative “TV ligada com dispositivo móvel” na LG e informe o endereço MAC.",
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                OutlinedTextField(
                    value = mac,
                    onValueChange = { mac = it },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    label = { Text("MAC da TV") },
                    placeholder = { Text("AA:BB:CC:DD:EE:FF") }
                )
                Button(onClick = { viewModel.wake(mac) }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(16.dp)) {
                    Icon(Icons.Rounded.PowerSettingsNew, contentDescription = null)
                    Spacer(Modifier.width(8.dp))
                    Text("Enviar sinal para ligar")
                }
            }
        }
        item {
            SettingsCard("Experiência", Icons.Rounded.ColorLens) {
                SettingSwitch(
                    title = "Resposta tátil",
                    subtitle = "Vibra suavemente ao pressionar controles",
                    checked = state.hapticsEnabled,
                    onChecked = viewModel::setHaptics
                )
                SettingSwitch(
                    title = "Modo compacto",
                    subtitle = "Prepara controles menores para telas compactas",
                    checked = state.compactMode,
                    onChecked = viewModel::setCompactMode
                )
            }
        }
        item {
            SettingsCard("Privacidade", Icons.Rounded.Info) {
                Text("• Nenhuma conta\n• Nenhum anúncio\n• Nenhuma telemetria\n• Comunicação somente na rede local", lineHeight = 23.sp)
            }
        }
        if (state.currentDevice != null) {
            item {
                OutlinedButton(
                    onClick = viewModel::forgetCurrentDevice,
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = MaterialTheme.colorScheme.error),
                    shape = RoundedCornerShape(18.dp)
                ) {
                    Text("Esquecer TV e apagar pareamento")
                }
            }
        }
    }
}

@Composable
private fun SettingsCard(title: String, icon: ImageVector, content: @Composable Column.() -> Unit) {
    Card(shape = RoundedCornerShape(24.dp), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)) {
        Column(Modifier.fillMaxWidth().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                Spacer(Modifier.width(9.dp))
                Text(title, fontWeight = FontWeight.SemiBold, fontSize = 17.sp)
            }
            content()
        }
    }
}

@Composable
private fun SettingSwitch(title: String, subtitle: String, checked: Boolean, onChecked: (Boolean) -> Unit) {
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.weight(1f)) {
            Text(title, fontWeight = FontWeight.Medium)
            Text(subtitle, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        Switch(checked = checked, onCheckedChange = onChecked)
    }
}

@Composable
private fun DevicePickerDialog(devices: List<TvDevice>, onSelect: (TvDevice) -> Unit, onDismiss: () -> Unit) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Escolha sua TV") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                devices.forEach { device ->
                    Card(
                        modifier = Modifier.fillMaxWidth().clickable { onSelect(device) },
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                    ) {
                        Row(Modifier.fillMaxWidth().padding(13.dp), verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Rounded.Tv, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                            Spacer(Modifier.width(10.dp))
                            Column {
                                Text(device.name, fontWeight = FontWeight.Medium, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                Text(device.ip, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        }
                    }
                }
            }
        },
        confirmButton = { TextButton(onClick = onDismiss) { Text("Cancelar") } }
    )
}

@Composable
private fun VerticalControlPill(
    modifier: Modifier,
    title: String,
    topIcon: ImageVector,
    bottomIcon: ImageVector,
    centerIcon: ImageVector,
    centerLabel: String,
    enabled: Boolean,
    haptics: Boolean,
    onTopStart: () -> Unit,
    onTopStop: () -> Unit,
    onBottomStart: () -> Unit,
    onBottomStop: () -> Unit,
    onCenter: () -> Unit
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(30.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
    ) {
        Column(
            modifier = Modifier.fillMaxWidth().padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(title, fontSize = 10.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.2.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            HoldIconButton(topIcon, "$title aumentar", enabled, haptics, onTopStart, onTopStop)
            FilledTonalButton(onClick = onCenter, enabled = enabled, shape = RoundedCornerShape(18.dp)) {
                Icon(centerIcon, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(6.dp))
                Text(centerLabel, maxLines = 1)
            }
            HoldIconButton(bottomIcon, "$title diminuir", enabled, haptics, onBottomStart, onBottomStop)
        }
    }
}

@Composable
private fun HoldIconButton(
    icon: ImageVector,
    label: String,
    enabled: Boolean,
    haptics: Boolean,
    onStart: () -> Unit,
    onStop: () -> Unit
) {
    val feedback = LocalHapticFeedback.current
    var pressed by remember { mutableStateOf(false) }
    val scale by animateFloatAsState(if (pressed) 0.9f else 1f, label = "hold-button")
    Box(
        modifier = Modifier
            .size(58.dp)
            .scale(scale)
            .clip(CircleShape)
            .background(if (enabled) MaterialTheme.colorScheme.surface else MaterialTheme.colorScheme.surface.copy(alpha = 0.4f))
            .semantics { contentDescription = label; role = Role.Button }
            .pointerInput(enabled) {
                if (!enabled) return@pointerInput
                awaitEachGesture {
                    awaitFirstDown(requireUnconsumed = false)
                    pressed = true
                    if (haptics) feedback.performHapticFeedback(HapticFeedbackType.LongPress)
                    onStart()
                    waitForUpOrCancellation()
                    pressed = false
                    onStop()
                }
            },
        contentAlignment = Alignment.Center
    ) {
        Icon(icon, contentDescription = null)
    }
}

@Composable
private fun QuickAction(
    modifier: Modifier,
    icon: ImageVector,
    text: String,
    enabled: Boolean,
    haptics: Boolean,
    onPress: () -> Unit
) {
    Column(modifier, horizontalAlignment = Alignment.CenterHorizontally) {
        PressIconButton(icon = icon, label = text, enabled = enabled, size = 48.dp, haptics = haptics, onPress = onPress)
        Spacer(Modifier.height(4.dp))
        Text(text, fontSize = 10.sp, maxLines = 1)
    }
}

@Composable
private fun PressIconButton(
    icon: ImageVector,
    label: String,
    enabled: Boolean,
    modifier: Modifier = Modifier,
    size: Dp = 60.dp,
    primary: Boolean = false,
    danger: Boolean = false,
    haptics: Boolean,
    onPress: () -> Unit
) {
    PressSurface(
        modifier = modifier,
        label = label,
        enabled = enabled,
        size = size,
        primary = primary,
        danger = danger,
        haptics = haptics,
        onPress = onPress
    ) {
        Icon(icon, contentDescription = null, modifier = Modifier.size(size * 0.42f))
    }
}

@Composable
private fun PressTextButton(
    text: String,
    label: String,
    enabled: Boolean,
    modifier: Modifier = Modifier,
    size: Dp,
    primary: Boolean = false,
    customColor: Color? = null,
    haptics: Boolean,
    onPress: () -> Unit
) {
    PressSurface(
        modifier = modifier,
        label = label,
        enabled = enabled,
        size = size,
        primary = primary,
        danger = false,
        customColor = customColor,
        haptics = haptics,
        onPress = onPress
    ) {
        Text(text, fontWeight = FontWeight.Bold, fontSize = if (size >= 70.dp) 18.sp else 16.sp)
    }
}

@Composable
private fun PressSurface(
    modifier: Modifier,
    label: String,
    enabled: Boolean,
    size: Dp,
    primary: Boolean,
    danger: Boolean,
    customColor: Color? = null,
    haptics: Boolean,
    onPress: () -> Unit,
    content: @Composable () -> Unit
) {
    val feedback = LocalHapticFeedback.current
    var pressed by remember { mutableStateOf(false) }
    val scale by animateFloatAsState(if (pressed) 0.88f else 1f, label = "press-scale")
    val background = when {
        !enabled -> MaterialTheme.colorScheme.surface.copy(alpha = 0.35f)
        customColor != null -> customColor
        danger -> MaterialTheme.colorScheme.errorContainer
        primary -> MaterialTheme.colorScheme.primary
        else -> MaterialTheme.colorScheme.surface
    }
    val foreground = when {
        !enabled -> MaterialTheme.colorScheme.onSurface.copy(alpha = 0.35f)
        customColor != null -> Color.White
        danger -> MaterialTheme.colorScheme.onErrorContainer
        primary -> MaterialTheme.colorScheme.onPrimary
        else -> MaterialTheme.colorScheme.onSurface
    }

    Box(
        modifier = modifier
            .size(size)
            .scale(scale)
            .clip(CircleShape)
            .background(background)
            .border(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = if (primary || danger || customColor != null) 0f else 0.2f), CircleShape)
            .semantics { contentDescription = label; role = Role.Button }
            .pointerInput(enabled) {
                if (!enabled) return@pointerInput
                awaitEachGesture {
                    awaitFirstDown(requireUnconsumed = false)
                    pressed = true
                    if (haptics) feedback.performHapticFeedback(HapticFeedbackType.LongPress)
                    onPress()
                    waitForUpOrCancellation()
                    pressed = false
                }
            },
        contentAlignment = Alignment.Center
    ) {
        androidx.compose.runtime.CompositionLocalProvider(androidx.compose.material3.LocalContentColor provides foreground) {
            content()
        }
    }
}
