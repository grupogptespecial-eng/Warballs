package com.geronimo.controlelgwifi

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material.icons.automirrored.rounded.VolumeDown
import androidx.compose.material.icons.automirrored.rounded.VolumeUp
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.Apps
import androidx.compose.material.icons.rounded.ArrowDownward
import androidx.compose.material.icons.rounded.ArrowForward
import androidx.compose.material.icons.rounded.ArrowUpward
import androidx.compose.material.icons.rounded.FastForward
import androidx.compose.material.icons.rounded.Home
import androidx.compose.material.icons.rounded.Info
import androidx.compose.material.icons.rounded.Keyboard
import androidx.compose.material.icons.rounded.Menu
import androidx.compose.material.icons.rounded.Pause
import androidx.compose.material.icons.rounded.PlayArrow
import androidx.compose.material.icons.rounded.PowerSettingsNew
import androidx.compose.material.icons.rounded.Remove
import androidx.compose.material.icons.rounded.Replay
import androidx.compose.material.icons.rounded.Settings
import androidx.compose.material.icons.rounded.Stop
import androidx.compose.material.icons.rounded.Tune
import androidx.compose.material.icons.rounded.VolumeOff
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlin.math.roundToInt

@Composable
fun PressControl(
    icon: ImageVector? = null,
    text: String? = null,
    contentDescription: String = text.orEmpty(),
    modifier: Modifier = Modifier,
    size: Dp = 56.dp,
    enabled: Boolean = true,
    danger: Boolean = false,
    primary: Boolean = false,
    showLabel: Boolean = true,
    haptics: Boolean = true,
    onPress: () -> Unit,
    onRelease: () -> Unit = {}
) {
    var pressed by remember { mutableStateOf(false) }
    val scale by animateFloatAsState(if (pressed) 0.94f else 1f, label = "press-scale")
    val haptic = LocalHapticFeedback.current
    val container = when {
        danger -> MaterialTheme.colorScheme.error.copy(alpha = 0.16f)
        primary -> MaterialTheme.colorScheme.primaryContainer
        else -> MaterialTheme.colorScheme.surfaceVariant
    }
    val foreground = when {
        danger -> MaterialTheme.colorScheme.error
        primary -> MaterialTheme.colorScheme.onPrimaryContainer
        else -> MaterialTheme.colorScheme.onSurface
    }
    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Surface(
            modifier = Modifier
                .size(size)
                .scale(scale)
                .semantics {
                    role = Role.Button
                    this.contentDescription = contentDescription
                }
                .pointerInput(enabled, haptics) {
                    if (!enabled) return@pointerInput
                    awaitEachGesture {
                        awaitPointerEventScope {
                            awaitFirstDown(requireUnconsumed = false)
                            pressed = true
                            if (haptics) haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                            onPress()
                            do {
                                val event = awaitPointerEvent()
                                val stillPressed = event.changes.any { it.pressed }
                            } while (stillPressed)
                            pressed = false
                            onRelease()
                        }
                    }
                },
            shape = CircleShape,
            color = if (enabled) container else container.copy(alpha = 0.42f),
            tonalElevation = if (pressed) 0.dp else 2.dp,
            shadowElevation = if (pressed) 0.dp else 1.dp
        ) {
            Box(contentAlignment = Alignment.Center) {
                when {
                    icon != null -> Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = if (enabled) foreground else foreground.copy(alpha = 0.42f),
                        modifier = Modifier.size(size * 0.42f)
                    )
                    text != null -> Text(
                        text = text,
                        color = if (enabled) foreground else foreground.copy(alpha = 0.42f),
                        fontWeight = FontWeight.SemiBold,
                        fontSize = (size.value * 0.24f).sp,
                        textAlign = TextAlign.Center
                    )
                }
            }
        }
        if (showLabel && text != null && icon != null) {
            Spacer(Modifier.height(5.dp))
            Text(
                text = text,
                fontSize = 11.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center,
                maxLines = 1
            )
        }
    }
}

@Composable
fun RemoteDPad(
    enabled: Boolean,
    haptics: Boolean,
    compact: Boolean,
    onAction: (RemoteAction) -> Unit
) {
    val outer = if (compact) 218.dp else 244.dp
    val direction = if (compact) 60.dp else 68.dp
    val center = if (compact) 78.dp else 88.dp
    Card(
        modifier = Modifier.size(outer),
        shape = CircleShape,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.78f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
    ) {
        Box(Modifier.size(outer).padding(12.dp), contentAlignment = Alignment.Center) {
            PressControl(
                icon = Icons.Rounded.ArrowUpward,
                contentDescription = "Cima",
                size = direction,
                enabled = enabled,
                haptics = haptics,
                showLabel = false,
                modifier = Modifier.align(Alignment.TopCenter),
                onPress = { onAction(RemoteAction.Up) }
            )
            PressControl(
                icon = Icons.Rounded.ArrowDownward,
                contentDescription = "Baixo",
                size = direction,
                enabled = enabled,
                haptics = haptics,
                showLabel = false,
                modifier = Modifier.align(Alignment.BottomCenter),
                onPress = { onAction(RemoteAction.Down) }
            )
            PressControl(
                text = "◀",
                contentDescription = "Esquerda",
                size = direction,
                enabled = enabled,
                haptics = haptics,
                showLabel = false,
                modifier = Modifier.align(Alignment.CenterStart),
                onPress = { onAction(RemoteAction.Left) }
            )
            PressControl(
                icon = Icons.Rounded.ArrowForward,
                contentDescription = "Direita",
                size = direction,
                enabled = enabled,
                haptics = haptics,
                showLabel = false,
                modifier = Modifier.align(Alignment.CenterEnd),
                onPress = { onAction(RemoteAction.Right) }
            )
            PressControl(
                text = "OK",
                contentDescription = "Confirmar",
                size = center,
                enabled = enabled,
                primary = true,
                haptics = haptics,
                showLabel = false,
                onPress = { onAction(RemoteAction.Enter) }
            )
        }
    }
}

@Composable
fun VolumeAndChannelControls(
    state: RemoteUiState,
    viewModel: RemoteViewModel,
    includeChannels: Boolean,
    compact: Boolean
) {
    val buttonSize = if (compact) 52.dp else 60.dp
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceEvenly,
        verticalAlignment = Alignment.CenterVertically
    ) {
        VerticalRocker(
            label = state.volume?.let { "VOL $it" } ?: "VOL",
            topIcon = Icons.AutoMirrored.Rounded.VolumeUp,
            bottomIcon = Icons.AutoMirrored.Rounded.VolumeDown,
            buttonSize = buttonSize,
            enabled = state.connected,
            haptics = state.hapticsEnabled,
            onTopPress = { viewModel.startRepeating(RemoteAction.VolumeUp) },
            onTopRelease = { viewModel.stopRepeating(RemoteAction.VolumeUp) },
            onBottomPress = { viewModel.startRepeating(RemoteAction.VolumeDown) },
            onBottomRelease = { viewModel.stopRepeating(RemoteAction.VolumeDown) }
        )
        PressControl(
            icon = if (state.muted) Icons.Rounded.VolumeOff else Icons.AutoMirrored.Rounded.VolumeUp,
            text = if (state.muted) "Sem som" else "Mudo",
            size = buttonSize,
            enabled = state.connected,
            haptics = state.hapticsEnabled,
            showLabel = state.showLabels,
            onPress = { viewModel.send(RemoteAction.Mute) }
        )
        if (includeChannels) {
            VerticalRocker(
                label = "CH",
                topIcon = Icons.Rounded.Add,
                bottomIcon = Icons.Rounded.Remove,
                buttonSize = buttonSize,
                enabled = state.connected,
                haptics = state.hapticsEnabled,
                onTopPress = { viewModel.startRepeating(RemoteAction.ChannelUp) },
                onTopRelease = { viewModel.stopRepeating(RemoteAction.ChannelUp) },
                onBottomPress = { viewModel.startRepeating(RemoteAction.ChannelDown) },
                onBottomRelease = { viewModel.stopRepeating(RemoteAction.ChannelDown) }
            )
        }
    }
}

@Composable
private fun VerticalRocker(
    label: String,
    topIcon: ImageVector,
    bottomIcon: ImageVector,
    buttonSize: Dp,
    enabled: Boolean,
    haptics: Boolean,
    onTopPress: () -> Unit,
    onTopRelease: () -> Unit,
    onBottomPress: () -> Unit,
    onBottomRelease: () -> Unit
) {
    Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(7.dp)) {
        PressControl(
            icon = topIcon,
            contentDescription = "$label aumentar",
            size = buttonSize,
            enabled = enabled,
            haptics = haptics,
            showLabel = false,
            onPress = onTopPress,
            onRelease = onTopRelease
        )
        Text(label, fontWeight = FontWeight.Bold, fontSize = 13.sp)
        PressControl(
            icon = bottomIcon,
            contentDescription = "$label diminuir",
            size = buttonSize,
            enabled = enabled,
            haptics = haptics,
            showLabel = false,
            onPress = onBottomPress,
            onRelease = onBottomRelease
        )
    }
}

@Composable
fun CoreActionRow(state: RemoteUiState, viewModel: RemoteViewModel) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
        PressControl(
            icon = Icons.AutoMirrored.Rounded.ArrowBack,
            text = "Voltar",
            enabled = state.connected,
            haptics = state.hapticsEnabled,
            showLabel = state.showLabels,
            onPress = { viewModel.send(RemoteAction.Back) }
        )
        PressControl(
            icon = Icons.Rounded.Home,
            text = "Home",
            enabled = state.connected,
            primary = true,
            haptics = state.hapticsEnabled,
            showLabel = state.showLabels,
            onPress = { viewModel.send(RemoteAction.Home) }
        )
        PressControl(
            icon = Icons.Rounded.Menu,
            text = "Menu",
            enabled = state.connected,
            haptics = state.hapticsEnabled,
            showLabel = state.showLabels,
            onPress = { viewModel.send(RemoteAction.Menu) }
        )
    }
}

@Composable
fun MediaControls(state: RemoteUiState, viewModel: RemoteViewModel) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
        PressControl(
            icon = Icons.Rounded.Replay,
            text = "Voltar",
            size = 52.dp,
            enabled = state.connected,
            haptics = state.hapticsEnabled,
            showLabel = false,
            onPress = { viewModel.send(RemoteAction.Rewind) }
        )
        PressControl(
            icon = Icons.Rounded.PlayArrow,
            text = "Reproduzir",
            size = 66.dp,
            enabled = state.connected,
            primary = true,
            haptics = state.hapticsEnabled,
            showLabel = false,
            onPress = { viewModel.send(RemoteAction.Play) }
        )
        PressControl(
            icon = Icons.Rounded.Pause,
            text = "Pausar",
            size = 52.dp,
            enabled = state.connected,
            haptics = state.hapticsEnabled,
            showLabel = false,
            onPress = { viewModel.send(RemoteAction.Pause) }
        )
        PressControl(
            icon = Icons.Rounded.FastForward,
            text = "Avançar",
            size = 52.dp,
            enabled = state.connected,
            haptics = state.hapticsEnabled,
            showLabel = false,
            onPress = { viewModel.send(RemoteAction.FastForward) }
        )
    }
}

@Composable
fun ShortcutRow(state: RemoteUiState, viewModel: RemoteViewModel) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        ShortcutPill(
            modifier = Modifier.weight(1f),
            icon = Icons.Rounded.Apps,
            label = "Apps",
            enabled = state.connected && TvCapability.Apps in state.capabilities,
            onClick = viewModel::openApps
        )
        ShortcutPill(
            modifier = Modifier.weight(1f),
            icon = Icons.Rounded.Tune,
            label = "Entradas",
            enabled = state.connected && TvCapability.Inputs in state.capabilities,
            onClick = viewModel::openInputs
        )
        ShortcutPill(
            modifier = Modifier.weight(1f),
            icon = Icons.Rounded.Keyboard,
            label = "Mais",
            enabled = state.connected,
            onClick = viewModel::openMore
        )
    }
}

@Composable
private fun ShortcutPill(
    modifier: Modifier,
    icon: ImageVector,
    label: String,
    enabled: Boolean,
    onClick: () -> Unit
) {
    Surface(
        onClick = onClick,
        enabled = enabled,
        modifier = modifier.height(54.dp),
        shape = RoundedCornerShape(18.dp),
        color = MaterialTheme.colorScheme.surfaceVariant
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            Icon(icon, contentDescription = null, modifier = Modifier.size(20.dp))
            Spacer(Modifier.width(7.dp))
            Text(label, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
        }
    }
}

@Composable
fun InfoMenuRow(state: RemoteUiState, viewModel: RemoteViewModel) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
        PressControl(
            icon = Icons.Rounded.Info,
            text = "Info",
            enabled = state.connected,
            haptics = state.hapticsEnabled,
            showLabel = state.showLabels,
            onPress = { viewModel.send(RemoteAction.Info) }
        )
        PressControl(
            icon = Icons.Rounded.Settings,
            text = "Ajustes TV",
            enabled = state.connected,
            haptics = state.hapticsEnabled,
            showLabel = state.showLabels,
            onPress = { viewModel.send(RemoteAction.Settings) }
        )
        PressControl(
            icon = Icons.Rounded.Stop,
            text = "Parar",
            enabled = state.connected,
            haptics = state.hapticsEnabled,
            showLabel = state.showLabels,
            onPress = { viewModel.send(RemoteAction.Stop) }
        )
    }
}

@Composable
fun ColorButtons(state: RemoteUiState, viewModel: RemoteViewModel) {
    val colors = listOf(
        "RED" to Color(0xFFEF5350),
        "GREEN" to Color(0xFF43A047),
        "YELLOW" to Color(0xFFFDD835),
        "BLUE" to Color(0xFF4285F4)
    )
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
        colors.forEach { (name, color) ->
            Surface(
                modifier = Modifier
                    .size(50.dp)
                    .pointerInput(state.connected) {
                        if (!state.connected) return@pointerInput
                        detectTapGestures { viewModel.sendColor(name) }
                    }
                    .semantics { contentDescription = "Botão ${name.lowercase()}" },
                shape = CircleShape,
                color = color.copy(alpha = if (state.connected) 1f else 0.35f),
                shadowElevation = 2.dp
            ) { }
        }
    }
}

@Composable
fun TouchpadSurface(state: RemoteUiState, viewModel: RemoteViewModel) {
    var dragging by remember { mutableStateOf(false) }
    val scale by animateFloatAsState(if (dragging) 0.992f else 1f, label = "touchpad-scale")
    Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(390.dp)
                .scale(scale)
                .background(MaterialTheme.colorScheme.surfaceVariant, RoundedCornerShape(30.dp))
                .border(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.25f), RoundedCornerShape(30.dp))
                .pointerInput(state.connected) {
                    if (!state.connected) return@pointerInput
                    detectTapGestures(onTap = { viewModel.clickPointer() })
                }
                .pointerInput(state.connected) {
                    if (!state.connected) return@pointerInput
                    detectDragGestures(
                        onDragStart = { dragging = true },
                        onDragEnd = { dragging = false },
                        onDragCancel = { dragging = false }
                    ) { change, amount ->
                        change.consume()
                        viewModel.movePointer(
                            (amount.x * 1.65f).roundToInt(),
                            (amount.y * 1.65f).roundToInt()
                        )
                    }
                },
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(
                    Icons.Rounded.PowerSettingsNew,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary.copy(alpha = 0.72f),
                    modifier = Modifier.size(36.dp)
                )
                Spacer(Modifier.height(12.dp))
                Text("Deslize para mover", fontWeight = FontWeight.SemiBold)
                Text(
                    "Toque para confirmar",
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 13.sp
                )
            }
        }
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            PressControl(
                icon = Icons.AutoMirrored.Rounded.ArrowBack,
                text = "Voltar",
                enabled = state.connected,
                haptics = state.hapticsEnabled,
                showLabel = state.showLabels,
                onPress = { viewModel.send(RemoteAction.Back) }
            )
            Surface(
                modifier = Modifier
                    .width(150.dp)
                    .height(56.dp)
                    .pointerInput(state.connected) {
                        if (!state.connected) return@pointerInput
                        detectDragGestures { change, amount ->
                            change.consume()
                            viewModel.scrollPointer((amount.y * 0.35f).roundToInt())
                        }
                    },
                shape = RoundedCornerShape(18.dp),
                color = MaterialTheme.colorScheme.surfaceVariant
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Text("↕  Rolagem", fontWeight = FontWeight.SemiBold)
                }
            }
            PressControl(
                icon = Icons.Rounded.Home,
                text = "Home",
                enabled = state.connected,
                primary = true,
                haptics = state.hapticsEnabled,
                showLabel = state.showLabels,
                onPress = { viewModel.send(RemoteAction.Home) }
            )
        }
    }
}
