package com.geronimo.controlelgwifi

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
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
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.Apps
import androidx.compose.material.icons.rounded.ArrowDownward
import androidx.compose.material.icons.rounded.ArrowUpward
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material.icons.rounded.Delete
import androidx.compose.material.icons.rounded.Devices
import androidx.compose.material.icons.rounded.Edit
import androidx.compose.material.icons.rounded.Info
import androidx.compose.material.icons.rounded.Keyboard
import androidx.compose.material.icons.rounded.Language
import androidx.compose.material.icons.rounded.Menu
import androidx.compose.material.icons.rounded.MoreHoriz
import androidx.compose.material.icons.rounded.NetworkCheck
import androidx.compose.material.icons.rounded.OpenInNew
import androidx.compose.material.icons.rounded.Palette
import androidx.compose.material.icons.rounded.PowerSettingsNew
import androidx.compose.material.icons.rounded.Refresh
import androidx.compose.material.icons.rounded.RestartAlt
import androidx.compose.material.icons.rounded.Save
import androidx.compose.material.icons.rounded.Search
import androidx.compose.material.icons.rounded.Security
import androidx.compose.material.icons.rounded.SettingsRemote
import androidx.compose.material.icons.rounded.Smartphone
import androidx.compose.material.icons.rounded.Tv
import androidx.compose.material.icons.rounded.Vibration
import androidx.compose.material.icons.rounded.Visibility
import androidx.compose.material.icons.rounded.Wifi
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ListItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun ConnectTvSheet(state: RemoteUiState, viewModel: RemoteViewModel) {
    var manualIp by remember { mutableStateOf("") }
    ModalBottomSheet(onDismissRequest = viewModel::closeConnect) {
        LazyColumn(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.88f)
                .imePadding(),
            contentPadding = androidx.compose.foundation.layout.PaddingValues(20.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            item {
                SheetHeading(
                    icon = Icons.Rounded.Tv,
                    title = "Conectar uma TV",
                    subtitle = "A busca acontece somente dentro da sua rede local."
                )
            }
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
                    shape = RoundedCornerShape(22.dp)
                ) {
                    Row(
                        Modifier.fillMaxWidth().padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        if (state.connectionState == ConnectionState.Discovering) {
                            CircularProgressIndicator(Modifier.size(28.dp), strokeWidth = 3.dp)
                        } else {
                            Icon(Icons.Rounded.Wifi, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                        }
                        Spacer(Modifier.width(12.dp))
                        Column(Modifier.weight(1f)) {
                            Text(
                                if (state.connectionState == ConnectionState.Discovering) "Procurando TVs…" else state.statusText,
                                fontWeight = FontWeight.SemiBold
                            )
                            Text(
                                "Mantenha a TV ligada durante o primeiro pareamento.",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        IconButton(onClick = viewModel::discover) {
                            Icon(Icons.Rounded.Refresh, contentDescription = "Procurar novamente")
                        }
                    }
                }
            }

            if (state.discoveredDevices.isNotEmpty()) {
                item { SectionTitle("Encontradas agora") }
                items(state.discoveredDevices, key = { "found-${it.ip}" }) { device ->
                    DeviceRow(device, connected = state.currentDevice?.ip == device.ip && state.connected) {
                        viewModel.connect(device)
                    }
                }
            }

            val offlineSaved = state.savedDevices.filter { saved -> state.discoveredDevices.none { it.ip == saved.ip } }
            if (offlineSaved.isNotEmpty()) {
                item { SectionTitle("Salvas") }
                items(offlineSaved, key = { "saved-${it.ip}" }) { device ->
                    DeviceRow(device, connected = state.currentDevice?.ip == device.ip && state.connected) {
                        viewModel.connect(device)
                    }
                }
            }

            item {
                HorizontalDivider(Modifier.padding(vertical = 4.dp))
                Text("Minha TV não apareceu", fontWeight = FontWeight.SemiBold)
                Spacer(Modifier.height(8.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    OutlinedTextField(
                        value = manualIp,
                        onValueChange = { manualIp = it },
                        label = { Text("IP da TV") },
                        placeholder = { Text("192.168.1.20") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Uri),
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                    Spacer(Modifier.width(10.dp))
                    Button(onClick = { viewModel.connectManual(manualIp) }, enabled = manualIp.isNotBlank()) {
                        Text("Conectar")
                    }
                }
                Spacer(Modifier.height(8.dp))
                Text(
                    "O IP manual é um recurso de recuperação. Normalmente basta tocar em Procurar novamente.",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@Composable
private fun DeviceRow(device: TvDevice, connected: Boolean, onClick: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (connected) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Row(Modifier.fillMaxWidth().padding(15.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(
                Modifier.size(46.dp).background(MaterialTheme.colorScheme.primary.copy(alpha = 0.15f), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Rounded.Tv, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
            }
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(device.displayName, fontWeight = FontWeight.SemiBold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Text(
                    listOfNotNull(device.model, device.ip).joinToString(" • "),
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            if (connected) {
                Icon(Icons.Rounded.Check, contentDescription = "Conectada", tint = MaterialTheme.colorScheme.primary)
            }
        }
    }
}

@Composable
fun AppsSheet(state: RemoteUiState, viewModel: RemoteViewModel) {
    var search by remember { mutableStateOf("") }
    val filtered = state.apps.filter { it.title.contains(search, ignoreCase = true) }
    ModalBottomSheet(onDismissRequest = viewModel::closeApps) {
        Column(Modifier.fillMaxWidth().fillMaxHeight(0.82f).padding(horizontal = 18.dp)) {
            SheetHeading(Icons.Rounded.Apps, "Aplicativos", "Abra os aplicativos instalados na TV.")
            OutlinedTextField(
                value = search,
                onValueChange = { search = it },
                label = { Text("Pesquisar") },
                leadingIcon = { Icon(Icons.Rounded.Search, contentDescription = null) },
                singleLine = true,
                modifier = Modifier.fillMaxWidth().padding(vertical = 10.dp)
            )
            if (filtered.isEmpty()) {
                EmptySheetMessage(
                    title = if (state.apps.isEmpty()) "Carregando aplicativos" else "Nenhum resultado",
                    body = if (state.apps.isEmpty()) "A lista aparecerá quando a TV responder." else "Tente outro nome."
                )
            } else {
                LazyVerticalGrid(
                    columns = GridCells.Adaptive(112.dp),
                    modifier = Modifier.fillMaxSize(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    contentPadding = androidx.compose.foundation.layout.PaddingValues(bottom = 24.dp)
                ) {
                    items(filtered, key = TvApp::id) { app ->
                        Card(
                            modifier = Modifier.height(104.dp).clickable {
                                viewModel.launchApp(app)
                                viewModel.closeApps()
                            },
                            shape = RoundedCornerShape(20.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                        ) {
                            Column(
                                Modifier.fillMaxSize().padding(12.dp),
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.Center
                            ) {
                                Box(
                                    Modifier.size(42.dp).background(MaterialTheme.colorScheme.primary.copy(alpha = 0.16f), RoundedCornerShape(13.dp)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(app.title.take(1).uppercase(), fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                                }
                                Spacer(Modifier.height(8.dp))
                                Text(app.title, textAlign = androidx.compose.ui.text.style.TextAlign.Center, maxLines = 2, fontSize = 12.sp, overflow = TextOverflow.Ellipsis)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun InputsSheet(state: RemoteUiState, viewModel: RemoteViewModel) {
    ModalBottomSheet(onDismissRequest = viewModel::closeInputs) {
        LazyColumn(
            modifier = Modifier.fillMaxWidth().fillMaxHeight(0.72f),
            contentPadding = androidx.compose.foundation.layout.PaddingValues(18.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            item { SheetHeading(Icons.Rounded.SettingsRemote, "Entradas", "Troque para HDMI, antena ou outra fonte disponível.") }
            if (state.inputs.isEmpty()) {
                item { EmptySheetMessage("Nenhuma entrada recebida", "Atualize os dados ou confira se a TV permite listar entradas.") }
            } else {
                items(state.inputs, key = TvInput::id) { input ->
                    Card(
                        modifier = Modifier.fillMaxWidth().clickable {
                            viewModel.switchInput(input)
                            viewModel.closeInputs()
                        },
                        shape = RoundedCornerShape(18.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                    ) {
                        Row(Modifier.fillMaxWidth().padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Rounded.OpenInNew, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                            Spacer(Modifier.width(13.dp))
                            Column(Modifier.weight(1f)) {
                                Text(input.label, fontWeight = FontWeight.SemiBold)
                                Text(input.id.replace('_', ' '), fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                            Text(if (input.connected) "Disponível" else "Desconectada", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun MoreControlsSheet(state: RemoteUiState, viewModel: RemoteViewModel) {
    var text by remember { mutableStateOf("") }
    ModalBottomSheet(onDismissRequest = viewModel::closeMore) {
        LazyColumn(
            modifier = Modifier.fillMaxWidth().fillMaxHeight(0.88f).imePadding(),
            contentPadding = androidx.compose.foundation.layout.PaddingValues(18.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item { SheetHeading(Icons.Rounded.MoreHoriz, "Mais controles", "Funções avançadas sem poluir o controle principal.") }
            item {
                SectionTitle("Digitar na TV")
                Row(verticalAlignment = Alignment.CenterVertically) {
                    OutlinedTextField(
                        value = text,
                        onValueChange = { text = it },
                        label = { Text("Texto") },
                        leadingIcon = { Icon(Icons.Rounded.Keyboard, contentDescription = null) },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                    Spacer(Modifier.width(9.dp))
                    Button(onClick = { viewModel.sendText(text); text = "" }, enabled = text.isNotBlank()) {
                        Text("Enviar")
                    }
                }
            }
            item {
                SectionTitle("Números")
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf(listOf(1, 2, 3), listOf(4, 5, 6), listOf(7, 8, 9), listOf(-1, 0, -2)).forEach { row ->
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                            row.forEach { number ->
                                if (number >= 0) {
                                    PressControl(
                                        text = number.toString(),
                                        size = 54.dp,
                                        enabled = state.connected,
                                        haptics = state.hapticsEnabled,
                                        showLabel = false,
                                        onPress = { viewModel.sendNumber(number) }
                                    )
                                } else {
                                    Spacer(Modifier.size(54.dp))
                                }
                            }
                        }
                    }
                }
            }
            item {
                SectionTitle("Botões coloridos")
                ColorButtons(state, viewModel)
            }
            item {
                SectionTitle("Menu e informações")
                InfoMenuRow(state, viewModel)
            }
            item {
                SectionTitle("Reprodução")
                MediaControls(state, viewModel)
            }
        }
    }
}

@Composable
fun PresetEditorSheet(state: RemoteUiState, viewModel: RemoteViewModel) {
    var renameText by remember(state.selectedPreset.name) { mutableStateOf(state.selectedPreset.name) }
    ModalBottomSheet(onDismissRequest = viewModel::closePresetEditor) {
        LazyColumn(
            modifier = Modifier.fillMaxWidth().fillMaxHeight(0.9f).imePadding(),
            contentPadding = androidx.compose.foundation.layout.PaddingValues(18.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            item { SheetHeading(Icons.Rounded.Edit, "Layouts do controle", "Escolha um preset ou monte até três controles personalizados.") }
            item {
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    RemotePresetId.entries.forEach { id ->
                        FilterChip(
                            selected = state.selectedPresetId == id,
                            onClick = { viewModel.selectPreset(id) },
                            label = { Text(state.presets[id]?.name ?: id.title) },
                            leadingIcon = if (state.selectedPresetId == id) {
                                { Icon(Icons.Rounded.Check, contentDescription = null, Modifier.size(18.dp)) }
                            } else null
                        )
                    }
                }
            }
            if (!state.selectedPresetId.isCustom) {
                item {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
                        shape = RoundedCornerShape(20.dp)
                    ) {
                        Column(Modifier.padding(16.dp)) {
                            Text("Preset protegido", fontWeight = FontWeight.SemiBold)
                            Text(
                                "Os presets básicos sempre podem ser restaurados. Copie este layout para personalizá-lo.",
                                fontSize = 13.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Spacer(Modifier.height(12.dp))
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                listOf(RemotePresetId.Custom1, RemotePresetId.Custom2, RemotePresetId.Custom3).forEach { destination ->
                                    AssistChip(
                                        onClick = { viewModel.copyPresetToCustom(state.selectedPresetId, destination) },
                                        label = { Text(destination.title.substringAfter(' ')) },
                                        leadingIcon = { Icon(Icons.Rounded.Add, contentDescription = null, Modifier.size(18.dp)) }
                                    )
                                }
                            }
                        }
                    }
                }
            } else {
                item {
                    OutlinedTextField(
                        value = renameText,
                        onValueChange = { renameText = it },
                        label = { Text("Nome do layout") },
                        trailingIcon = {
                            IconButton(onClick = { viewModel.renamePreset(renameText) }) {
                                Icon(Icons.Rounded.Save, contentDescription = "Salvar nome")
                            }
                        },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
                item { SectionTitle("Ordem e conteúdo") }
                items(state.selectedPreset.modules, key = RemoteModule::name) { module ->
                    ModuleEditorRow(
                        module = module,
                        supported = module.requiredCapability == null || module.requiredCapability in state.capabilities,
                        onRemove = { viewModel.toggleModule(module) },
                        onUp = { viewModel.moveModule(module, -1) },
                        onDown = { viewModel.moveModule(module, 1) }
                    )
                }
                item {
                    SectionTitle("Adicionar controles")
                    FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        RemoteModule.entries.filterNot { it in state.selectedPreset.modules }.forEach { module ->
                            AssistChip(
                                onClick = { viewModel.toggleModule(module) },
                                label = { Text(module.title) },
                                leadingIcon = { Icon(Icons.Rounded.Add, contentDescription = null, Modifier.size(18.dp)) }
                            )
                        }
                    }
                }
                item {
                    OutlinedButton(onClick = { viewModel.resetPreset() }, modifier = Modifier.fillMaxWidth()) {
                        Icon(Icons.Rounded.RestartAlt, contentDescription = null)
                        Spacer(Modifier.width(8.dp))
                        Text("Restaurar layout")
                    }
                }
            }
        }
    }
}

@Composable
private fun ModuleEditorRow(
    module: RemoteModule,
    supported: Boolean,
    onRemove: () -> Unit,
    onUp: () -> Unit,
    onDown: () -> Unit
) {
    Card(shape = RoundedCornerShape(18.dp), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)) {
        Row(Modifier.fillMaxWidth().padding(10.dp), verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Rounded.SettingsRemote, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
            Spacer(Modifier.width(10.dp))
            Column(Modifier.weight(1f)) {
                Text(module.title, fontWeight = FontWeight.SemiBold)
                if (!supported) Text("Pode não funcionar nesta TV", fontSize = 11.sp, color = MaterialTheme.colorScheme.error)
            }
            IconButton(onClick = onUp) { Icon(Icons.Rounded.ArrowUpward, contentDescription = "Mover para cima") }
            IconButton(onClick = onDown) { Icon(Icons.Rounded.ArrowDownward, contentDescription = "Mover para baixo") }
            IconButton(onClick = onRemove) { Icon(Icons.Rounded.Close, contentDescription = "Remover") }
        }
    }
}

@Composable
fun SettingsSheet(state: RemoteUiState, viewModel: RemoteViewModel) {
    var editDevice by remember { mutableStateOf(false) }
    ModalBottomSheet(onDismissRequest = viewModel::closeSettings) {
        LazyColumn(
            modifier = Modifier.fillMaxWidth().fillMaxHeight(0.94f),
            contentPadding = androidx.compose.foundation.layout.PaddingValues(bottom = 34.dp),
        ) {
            item {
                Column(Modifier.padding(horizontal = 20.dp)) {
                    SheetHeading(Icons.Rounded.SettingsRemote, "Configurações", "Personalize o controle sem perder a simplicidade.")
                }
            }
            item { SettingsSectionLabel("DISPOSITIVOS") }
            item {
                SettingsAction(
                    Icons.Rounded.Devices,
                    "TVs conectadas",
                    state.currentDevice?.displayName ?: "Nenhuma TV selecionada",
                    onClick = viewModel::openConnect
                )
            }
            if (state.currentDevice != null) {
                item {
                    SettingsAction(Icons.Rounded.Edit, "Nome, cômodo e MAC", "Edite os dados desta TV") { editDevice = true }
                }
                item {
                    SettingsAction(Icons.Rounded.PowerSettingsNew, "Ligar TV", "Envia Wake-on-LAN") { viewModel.wake() }
                }
            }
            item {
                SettingsAction(Icons.Rounded.NetworkCheck, "Diagnóstico de rede", state.diagnostic.summary) { viewModel.runDiagnostics() }
            }
            item { SettingsToggle(Icons.Rounded.Wifi, "Reconectar automaticamente", "Tenta restaurar a conexão sem interromper você", state.autoConnect, viewModel::setAutoConnect) }

            item { SettingsSectionLabel("CONTROLE") }
            item {
                SettingsAction(Icons.Rounded.SettingsRemote, "Layout", state.selectedPreset.name) { viewModel.openPresetEditor() }
            }
            item { SettingsToggle(Icons.Rounded.Visibility, "Mostrar nomes dos botões", "Útil para aprender os ícones", state.showLabels, viewModel::setShowLabels) }
            item { SettingsToggle(Icons.Rounded.Smartphone, "Modo compacto", "Exibe mais funções em telas pequenas", state.compactMode, viewModel::setCompactMode) }
            item { SettingsToggle(Icons.Rounded.Vibration, "Vibração", "Resposta tátil ao tocar", state.hapticsEnabled, viewModel::setHaptics) }

            item { SettingsSectionLabel("APARÊNCIA") }
            item {
                Column(Modifier.padding(horizontal = 20.dp, vertical = 10.dp)) {
                    Text("Tema", fontWeight = FontWeight.SemiBold)
                    Spacer(Modifier.height(8.dp))
                    FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        ThemeMode.entries.forEach { mode ->
                            FilterChip(
                                selected = state.themeMode == mode,
                                onClick = { viewModel.setTheme(mode) },
                                label = { Text(mode.themeLabel()) }
                            )
                        }
                    }
                }
            }
            item {
                Column(Modifier.padding(horizontal = 20.dp, vertical = 10.dp)) {
                    Text("Cor", fontWeight = FontWeight.SemiBold)
                    Spacer(Modifier.height(8.dp))
                    FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        AccentTheme.entries.forEach { accent ->
                            FilterChip(
                                selected = state.accentTheme == accent,
                                onClick = { viewModel.setAccent(accent) },
                                label = { Text(accent.accentLabel()) },
                                leadingIcon = { Box(Modifier.size(14.dp).background(accent.previewColor(), CircleShape)) }
                            )
                        }
                    }
                }
            }

            item { SettingsSectionLabel("PRIVACIDADE E SOBRE") }
            item { SettingsInfo(Icons.Rounded.Security, "Privacidade", "Sem conta, anúncios, telemetria ou servidor externo") }
            item { SettingsInfo(Icons.Rounded.Language, "Idioma", "Português; estrutura preparada para traduções") }
            item { SettingsInfo(Icons.Rounded.Info, "Libre Remote 1.0 RC1", "Projeto comunitário e não afiliado à LG Electronics") }
        }
    }

    if (editDevice && state.currentDevice != null) {
        EditDeviceDialog(
            device = state.currentDevice,
            onDismiss = { editDevice = false },
            onSave = { name, room, mac ->
                viewModel.updateCurrentDevice(name, room, mac)
                editDevice = false
            },
            onForget = {
                viewModel.forgetDevice(state.currentDevice)
                editDevice = false
            }
        )
    }
}

@Composable
private fun EditDeviceDialog(
    device: TvDevice,
    onDismiss: () -> Unit,
    onSave: (String, String, String) -> Unit,
    onForget: () -> Unit
) {
    var name by remember { mutableStateOf(device.name) }
    var room by remember { mutableStateOf(device.room) }
    var mac by remember { mutableStateOf(device.mac.orEmpty()) }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Editar TV") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(name, { name = it }, label = { Text("Nome") }, singleLine = true)
                OutlinedTextField(room, { room = it }, label = { Text("Cômodo") }, singleLine = true)
                OutlinedTextField(mac, { mac = it }, label = { Text("MAC para ligar") }, placeholder = { Text("AA:BB:CC:DD:EE:FF") }, singleLine = true)
                TextButton(onClick = onForget) {
                    Icon(Icons.Rounded.Delete, contentDescription = null, tint = MaterialTheme.colorScheme.error)
                    Spacer(Modifier.width(6.dp))
                    Text("Esquecer esta TV", color = MaterialTheme.colorScheme.error)
                }
            }
        },
        confirmButton = { Button(onClick = { onSave(name, room, mac) }) { Text("Salvar") } },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancelar") } }
    )
}

@Composable
private fun SettingsSectionLabel(text: String) {
    Text(
        text,
        modifier = Modifier.padding(start = 20.dp, top = 22.dp, bottom = 7.dp),
        color = MaterialTheme.colorScheme.primary,
        fontSize = 12.sp,
        fontWeight = FontWeight.Bold
    )
}

@Composable
private fun SettingsAction(icon: ImageVector, title: String, subtitle: String, onClick: () -> Unit) {
    ListItem(
        headlineContent = { Text(title, fontWeight = FontWeight.Medium) },
        supportingContent = { Text(subtitle, maxLines = 2, overflow = TextOverflow.Ellipsis) },
        leadingContent = { Icon(icon, contentDescription = null) },
        trailingContent = { Icon(Icons.Rounded.OpenInNew, contentDescription = null, Modifier.size(18.dp)) },
        modifier = Modifier.clickable(onClick = onClick)
    )
    HorizontalDivider(Modifier.padding(horizontal = 20.dp), color = MaterialTheme.colorScheme.outline.copy(alpha = 0.2f))
}

@Composable
private fun SettingsToggle(icon: ImageVector, title: String, subtitle: String, checked: Boolean, onChecked: (Boolean) -> Unit) {
    ListItem(
        headlineContent = { Text(title, fontWeight = FontWeight.Medium) },
        supportingContent = { Text(subtitle) },
        leadingContent = { Icon(icon, contentDescription = null) },
        trailingContent = { Switch(checked = checked, onCheckedChange = onChecked) }
    )
    HorizontalDivider(Modifier.padding(horizontal = 20.dp), color = MaterialTheme.colorScheme.outline.copy(alpha = 0.2f))
}

@Composable
private fun SettingsInfo(icon: ImageVector, title: String, subtitle: String) {
    ListItem(
        headlineContent = { Text(title, fontWeight = FontWeight.Medium) },
        supportingContent = { Text(subtitle) },
        leadingContent = { Icon(icon, contentDescription = null) }
    )
    HorizontalDivider(Modifier.padding(horizontal = 20.dp), color = MaterialTheme.colorScheme.outline.copy(alpha = 0.2f))
}

@Composable
private fun SheetHeading(icon: ImageVector, title: String, subtitle: String) {
    Row(Modifier.fillMaxWidth().padding(bottom = 4.dp), verticalAlignment = Alignment.CenterVertically) {
        Box(
            Modifier.size(48.dp).background(MaterialTheme.colorScheme.primaryContainer, RoundedCornerShape(16.dp)),
            contentAlignment = Alignment.Center
        ) {
            Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
        }
        Spacer(Modifier.width(13.dp))
        Column(Modifier.weight(1f)) {
            Text(title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            Text(subtitle, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
private fun SectionTitle(text: String) {
    Text(text, fontWeight = FontWeight.Bold, fontSize = 15.sp)
}

@Composable
private fun EmptySheetMessage(title: String, body: String) {
    Column(
        modifier = Modifier.fillMaxWidth().padding(vertical = 38.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(title, fontWeight = FontWeight.SemiBold)
        Text(body, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 13.sp)
    }
}

private fun ThemeMode.themeLabel(): String = when (this) {
    ThemeMode.System -> "Sistema"
    ThemeMode.Light -> "Claro"
    ThemeMode.Dark -> "Escuro"
    ThemeMode.Amoled -> "AMOLED"
}

private fun AccentTheme.accentLabel(): String = when (this) {
    AccentTheme.Ocean -> "Oceano"
    AccentTheme.Violet -> "Violeta"
    AccentTheme.Emerald -> "Esmeralda"
    AccentTheme.Sunset -> "Pôr do sol"
    AccentTheme.Monochrome -> "Mono"
}

private fun AccentTheme.previewColor(): Color = when (this) {
    AccentTheme.Ocean -> Color(0xFF55C8FF)
    AccentTheme.Violet -> Color(0xFFB59CFF)
    AccentTheme.Emerald -> Color(0xFF59E0A1)
    AccentTheme.Sunset -> Color(0xFFFF9B73)
    AccentTheme.Monochrome -> Color(0xFFB8C1CC)
}
