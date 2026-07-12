# Google Play Data Safety — respostas preparadas

## Coleta e compartilhamento

- O aplicativo coleta ou compartilha dados do usuário? **Não**.
- Dados processados somente no dispositivo: IP e nome da TV, MAC opcional, preferências, layouts e chave de pareamento.
- Esses dados são enviados ao desenvolvedor? **Não**.
- O aplicativo contém anúncios? **Não**.
- O aplicativo contém analytics, telemetria ou SDK de rastreamento? **Não**.
- O aplicativo permite solicitar exclusão? Os dados são locais e podem ser removidos em **Esquecer TV**, limpar dados ou desinstalar.

## Segurança

- Comunicação com servidor externo: **não existe**.
- Comunicação local com a TV: WebSocket local; WSS quando suportado, com verificação TOFU do certificado.
- Chave de pareamento: Android EncryptedSharedPreferences/Keystore.
- Backup de dados sensíveis: desativado.

## Permissões declaradas

- INTERNET: abrir sockets diretamente com a TV na rede local.
- ACCESS_NETWORK_STATE / ACCESS_WIFI_STATE: verificar a rede atual.
- CHANGE_WIFI_MULTICAST_STATE: descoberta SSDP.
- WAKE_LOCK: manter uma operação curta de conexão ativa.
- NEARBY_WIFI_DEVICES: compatibilidade com proteções de rede local do Android.
- ACCESS_LOCAL_NETWORK: preparação para Android 17/API 37.

## Público e conteúdo

- Público-alvo sugerido no Play Console: público geral, não especificamente infantil.
- Conteúdo gerado por usuário: não.
- Compras no app: não.
- Login: não.
- Localização: não coletada.
- Fotos, arquivos, contatos, câmera e microfone: não acessados.

Revise estas respostas após qualquer nova dependência. Um SDK de analytics ou anúncios mudaria a declaração.