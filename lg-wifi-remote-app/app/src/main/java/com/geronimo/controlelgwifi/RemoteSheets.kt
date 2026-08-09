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
                item { SectionTitle(tr("Encontradas agora")) }
                items(state.discoveredDevices, key = { "found-${it.stableId}" }) { device ->
                    DeviceRow(device, connected = state.currentDevice?.stableId == device.stableId && state.connected) {
                        viewModel.connect(device)
                    }
                }
            }

            val offlineSaved = state.savedDevices.filter { saved -> state.discoveredDevices.none { it.stableId == saved.stableId } }
            if (offlineSaved.isNotEmpty()) {
                item { SectionTitle(tr("Salvas")) }
                items(offlineSaved, key = { "saved-${it.stableId}" }) { device ->
                    DeviceRow(device, connected = state.currentDevice?.stableId == device.stableId && state.connected) {
                        viewModel.connect(device)
                    }
                }
            }

            item {
                HorizontalDivider(Modifier.padding(vertical = 4.dp))
                Text(tr("Minha TV não apareceu"), fontWeight = FontWeight.SemiBold)
                Spacer(Modifier.height(8.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    OutlinedTextField(
                        value = manualIp,
                        onValueChange = { manualIp = it },
                        label = { Text(tr("IP da TV")) },
                        placeholder = { Text(tr("192.168.1.20")) },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Uri),
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                    Spacer(Modifier.width(10.dp))
                    Button(onClick = { viewModel.connectManual(manualIp) }, enabled = manualIp.isNotBlank()) {
                        Text(tr("Conectar"))
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
                    listOfNotNull(device.platformLabel, device.supportLabel, device.model, device.ip).joinToString(" • "),
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
                label = { Text(tr("Pesquisar")) },
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
                SectionTitle(tr("Digitar na TV"))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    OutlinedTextField(
                        value = text,
                        onValueChange = { text = it },
                        label = { Text(tr("Texto")) },
                        leadingIcon = { Icon(Icons.Rounded.Keyboard, contentDescription = null) },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                    Spacer(Modifier.width(9.dp))
                    Button(onClick = { viewModel.sendText(text); text = "" }, enabled = text.isNotBlank()) {
                        Text(tr("Enviar"))
                    }
                }
            }
            item {
                SectionTitle(tr("Números"))
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
                SectionTitle(tr("Botões coloridos"))
                ColorButtons(state, viewModel)
            }
            item {
                SectionTitle(tr("Menu e informações"))
                InfoMenuRow(state, viewModel)
            }
            item {
                SectionTitle(tr("Reprodução"))
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
                            Text(tr("Preset protegido"), fontWeight = FontWeight.SemiBold)
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
                        label = { Text(tr("Nome do layout")) },
                        trailingIcon = {
                            IconButton(onClick = { viewModel.renamePreset(renameText) }) {
                                Icon(Icons.Rounded.Save, contentDescription = "Salvar nome")
                            }
                        },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
                item { SectionTitle(tr("Ordem e conteúdo")) }
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
                    SectionTitle(tr("Adicionar controles"))
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
                        Text(tr("Restaurar layout"))
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
                if (!supported) Text(tr("Pode não funcionar nesta TV"), fontSize = 11.sp, color = MaterialTheme.colorScheme.error)
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
                    SheetHeading(Icons.Rounded.SettingsRemote, tr("Configurações"), tr("Personalize o controle sem perder a simplicidade."))
                }
            }
            item { SettingsSectionLabel(tr("DISPOSITIVOS")) }
            item {
                SettingsAction(
                    Icons.Rounded.Devices,
                    tr("TVs conectadas"),
                    state.currentDevice?.displayName ?: tr("Nenhuma TV selecionada"),
                    onClick = viewModel::openConnect
                )
            }
            if (state.currentDevice != null) {
                item {
                    SettingsAction(Icons.Rounded.Edit, tr("Nome, cômodo e MAC"), tr("Edite os dados desta TV")) { editDevice = true }
                }
                item {
                    SettingsAction(Icons.Rounded.PowerSettingsNew, tr("Ligar TV"), tr("Envia Wake-on-LAN")) { viewModel.wake() }
                }
            }
            item {
                SettingsAction(
                    Icons.Rounded.NetworkCheck,
                    tr("Diagnóstico de rede"),
                    listOfNotNull(
                        state.diagnostic.summary,
                        state.diagnostic.backendSummary,
                        state.diagnostic.lastCommandDispatchMs?.let { "Envio local: %.2f ms".format(it) }
                    ).joinToString(" • "),
                    onClick = viewModel::runDiagnostics
                )
            }
            item { SettingsToggle(Icons.Rounded.Wifi, tr("Reconectar automaticamente"), tr("Tenta restaurar a conexão sem interromper você"), state.autoConnect, viewModel::setAutoConnect) }
            item { SettingsToggle(Icons.Rounded.Devices, tr("Sistemas experimentais"), tr("Permite testar Samsung Tizen e plataformas ainda em validação"), state.experimentalBackendsEnabled, viewModel::setExperimentalBackendsEnabled) }

            item { SettingsSectionLabel(tr("CONTROLE")) }
            item {
                SettingsAction(Icons.Rounded.SettingsRemote, tr("Layout"), state.selectedPreset.name) { viewModel.openPresetEditor() }
            }
            item { SettingsToggle(Icons.Rounded.Visibility, tr("Mostrar nomes dos botões"), tr("Útil para aprender os ícones"), state.showLabels, viewModel::setShowLabels) }
            item { SettingsToggle(Icons.Rounded.Smartphone, tr("Modo compacto"), tr("Exibe mais funções em telas pequenas"), state.compactMode, viewModel::setCompactMode) }
            item { SettingsToggle(Icons.Rounded.Vibration, tr("Vibração"), tr("Resposta tátil ao tocar"), state.hapticsEnabled, viewModel::setHaptics) }

            item { SettingsSectionLabel(tr("IDIOMA E VOZ")) }
            item {
                Column(Modifier.padding(horizontal = 20.dp, vertical = 10.dp)) {
                    Text(tr("Idioma do aplicativo"), fontWeight = FontWeight.SemiBold)
                    Spacer(Modifier.height(8.dp))
                    FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        AppLanguage.entries.forEach { language ->
                            FilterChip(
                                selected = state.appLanguage == language,
                                onClick = { viewModel.setAppLanguage(language) },
                                label = { Text(tr(language.displayLabel())) }
                            )
                        }
                    }
                }
            }
            item {
                Column(Modifier.padding(horizontal = 20.dp, vertical = 10.dp)) {
                    Text(tr("Idioma do microfone"), fontWeight = FontWeight.SemiBold)
                    Spacer(Modifier.height(8.dp))
                    FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        VoiceLanguage.entries.forEach { language ->
                            FilterChip(
                                selected = state.voiceLanguage == language,
                                onClick = { viewModel.setVoiceLanguage(language) },
                                label = { Text(tr(language.displayLabel())) }
                            )
                        }
                    }
                }
            }

            item { SettingsSectionLabel(tr("APARÊNCIA")) }
            item {
                Column(Modifier.padding(horizontal = 20.dp, vertical = 10.dp)) {
                    Text(tr("Tema"), fontWeight = FontWeight.SemiBold)
                    Spacer(Modifier.height(8.dp))
                    FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        ThemeMode.entries.forEach { mode ->
                            FilterChip(
                                selected = state.themeMode == mode,
                                onClick = { viewModel.setTheme(mode) },
                                label = { Text(tr(mode.themeLabel())) }
                            )
                        }
                    }
                }
            }
            item {
                Column(Modifier.padding(horizontal = 20.dp, vertical = 10.dp)) {
                    Text(tr("Cor"), fontWeight = FontWeight.SemiBold)
                    Spacer(Modifier.height(8.dp))
                    FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        AccentTheme.entries.forEach { accent ->
                            FilterChip(
                                selected = state.accentTheme == accent,
                                onClick = { viewModel.setAccent(accent) },
                                label = { Text(tr(accent.accentLabel())) },
                                leadingIcon = { Box(Modifier.size(14.dp).background(accent.previewColor(), CircleShape)) }
                            )
                        }
                    }
                }
            }

            item { SettingsSectionLabel(tr("ANIMAÇÕES")) }
            item {
                Column(Modifier.padding(horizontal = 20.dp, vertical = 10.dp)) {
                    Text(tr("Fundo animado"), fontWeight = FontWeight.SemiBold)
                    Spacer(Modifier.height(8.dp))
                    FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        BackgroundEffect.entries.forEach { effect ->
                            FilterChip(
                                selected = state.backgroundEffect == effect,
                                onClick = { viewModel.setBackgroundEffect(effect) },
                                label = { Text(tr(effect.displayLabel())) }
                            )
                        }
                    }
                }
            }
            item {
                Column(Modifier.padding(horizontal = 20.dp, vertical = 10.dp)) {
                    Text(tr("Movimento"), fontWeight = FontWeight.SemiBold)
                    Spacer(Modifier.height(8.dp))
                    FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        AnimationPreset.entries.forEach { preset ->
                            FilterChip(
                                selected = state.animationPreset == preset,
                                onClick = { viewModel.setAnimationPreset(preset) },
                                label = { Text(tr(preset.displayLabel())) }
                            )
                        }
                    }
                }
            }
            item {
                Column(Modifier.padding(horizontal = 20.dp, vertical = 10.dp)) {
                    Text(tr("Efeito ao tocar"), fontWeight = FontWeight.SemiBold)
                    Spacer(Modifier.height(8.dp))
                    FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        ButtonEffect.entries.forEach { effect ->
                            FilterChip(
                                selected = state.buttonEffect == effect,
                                onClick = { viewModel.setButtonEffect(effect) },
                                label = { Text(tr(effect.displayLabel())) }
                            )
                        }
                    }
                }
            }

            item { SettingsSectionLabel(tr("PRIVACIDADE E SOBRE")) }
            item { SettingsInfo(Icons.Rounded.Security, tr("Privacidade"), tr("Sem conta, anúncios, telemetria ou servidor externo")) }
            item { SettingsInfo(Icons.Rounded.Language, tr("Idioma"), tr("Português, inglês e espanhol; microfone com idiomas adicionais")) }
            item { SettingsInfo(Icons.Rounded.Info, "Libre Remote 2.0 RC4", "LG webOS • Samsung/DLNA conforme suporte local") }
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
        title = { Text(tr("Editar TV")) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(name, { name = it }, label = { Text(tr("Nome")) }, singleLine = true)
                OutlinedTextField(room, { room = it }, label = { Text(tr("Cômodo")) }, singleLine = true)
                OutlinedTextField(mac, { mac = it }, label = { Text(tr("MAC para ligar")) }, placeholder = { Text(tr("AA:BB:CC:DD:EE:FF")) }, singleLine = true)
                TextButton(onClick = onForget) {
                    Icon(Icons.Rounded.Delete, contentDescription = null, tint = MaterialTheme.colorScheme.error)
                    Spacer(Modifier.width(6.dp))
                    Text(tr("Esquecer esta TV"), color = MaterialTheme.colorScheme.error)
                }
            }
        },
        confirmButton = { Button(onClick = { onSave(name, room, mac) }) { Text(tr("Salvar")) } },
        dismissButton = { TextButton(onClick = onDismiss) { Text(tr("Cancelar")) } }
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
    AccentTheme.Aurora -> "Aurora"
    AccentTheme.Rose -> "Rosa"
    AccentTheme.Cyber -> "Cyber"
    AccentTheme.Gold -> "Dourado"
    AccentTheme.Arctic -> "Ártico"
}

private fun AccentTheme.previewColor(): Color = when (this) {
    AccentTheme.Ocean -> Color(0xFF55C8FF)
    AccentTheme.Violet -> Color(0xFFB59CFF)
    AccentTheme.Emerald -> Color(0xFF59E0A1)
    AccentTheme.Sunset -> Color(0xFFFF9B73)
    AccentTheme.Monochrome -> Color(0xFFB8C1CC)
    AccentTheme.Aurora -> Color(0xFF7CFFCB)
    AccentTheme.Rose -> Color(0xFFFF7EB6)
    AccentTheme.Cyber -> Color(0xFF35F2FF)
    AccentTheme.Gold -> Color(0xFFFFD166)
    AccentTheme.Arctic -> Color(0xFF9CE6FF)
}
