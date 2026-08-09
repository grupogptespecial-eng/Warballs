package com.geronimo.controlelgwifi

import androidx.compose.runtime.Composable
import androidx.compose.runtime.staticCompositionLocalOf

val LocalAppLanguage = staticCompositionLocalOf { AppLanguage.PortugueseBrazil }

private val english = mapOf(
    "Desligar a TV?" to "Turn off the TV?",
    "Para ligar novamente pelo aplicativo, a TV precisa ter Mobile TV On/Wake-on-LAN ativado." to "To turn it on again from the app, Mobile TV On/Wake-on-LAN must be enabled on the TV.",
    "Desligar" to "Turn off",
    "Cancelar" to "Cancel",
    "Reconectar" to "Reconnect",
    "Desligar TV" to "Turn off TV",
    "Ligar TV" to "Turn on TV",
    "Configurações" to "Settings",
    "Aceite o pedido mostrado na televisão" to "Accept the request shown on the TV",
    "Seu controle, sem anúncios" to "Your remote, without ads",
    "Conecte a TV uma vez. Nas próximas aberturas, o aplicativo tenta reconectar automaticamente." to "Connect the TV once. On future launches, the app will try to reconnect automatically.",
    "Conectar TV" to "Connect TV",
    "Verificar minha rede" to "Check my network",
    "O acesso à rede local é necessário somente para localizar e controlar a TV." to "Local network access is only needed to find and control the TV.",
    "Controle" to "Remote",
    "Touchpad" to "Touchpad",
    "Pronto para usar" to "Ready to use",
    "Os botões serão ativados após a conexão" to "Buttons will be enabled after connection",
    "Editar" to "Edit",
    "Abrir teclado numérico" to "Open numeric keypad",
    "Avançado AL" to "Advanced AL",
    "Tudo em um só controle • role do início ao fim" to "Everything in one remote • scroll from start to finish",
    "Preset" to "Preset",
    "Navegação" to "Navigation",
    "Sistema" to "System",
    "Volume e canais" to "Volume and channels",
    "Reprodução" to "Playback",
    "Mousepad / touchpad" to "Mousepad / touchpad",
    "Botões coloridos" to "Colored buttons",
    "Info e ajustes da TV" to "TV info and settings",
    "Conexão" to "Connection",
    "IP / endereço local da TV" to "TV IP / local address",
    "Conectar" to "Connect",
    "Buscar TVs" to "Find TVs",
    "Reconectar agora" to "Reconnect now",
    "MAC para ligar pela rede" to "MAC for network wake",
    "Salvar MAC" to "Save MAC",
    "Entradas" to "Inputs",
    "Aplicativos" to "Apps",
    "Digitar na TV" to "Type on TV",
    "Texto" to "Text",
    "Enviar" to "Send",
    "Números" to "Numbers",
    "Mais controles" to "More controls",
    "Funções avançadas sem poluir o controle principal." to "Advanced functions without cluttering the main remote.",
    "Conectar uma TV" to "Connect a TV",
    "A busca acontece somente dentro da sua rede local." to "Discovery only happens inside your local network.",
    "Procurando TVs…" to "Looking for TVs…",
    "Mantenha a TV ligada durante o primeiro pareamento." to "Keep the TV on during the first pairing.",
    "Encontradas agora" to "Found now",
    "Salvas" to "Saved",
    "Minha TV não apareceu" to "My TV did not appear",
    "IP da TV" to "TV IP",
    "O IP manual é um recurso de recuperação. Normalmente basta tocar em Procurar novamente." to "Manual IP is a recovery option. Usually, tapping Find again is enough.",
    "Layouts do controle" to "Remote layouts",
    "Escolha um preset ou monte até três controles personalizados." to "Choose a preset or build up to three custom remotes.",
    "Nome do layout" to "Layout name",
    "Ordem e conteúdo" to "Order and content",
    "Adicionar controles" to "Add controls",
    "Restaurar layout" to "Restore layout",
    "Configurações" to "Settings",
    "Personalize o controle sem perder a simplicidade." to "Customize the remote without losing simplicity.",
    "DISPOSITIVOS" to "DEVICES",
    "TVs conectadas" to "Connected TVs",
    "Nenhuma TV selecionada" to "No TV selected",
    "Nome, cômodo e MAC" to "Name, room and MAC",
    "Edite os dados desta TV" to "Edit this TV's details",
    "Ligar TV" to "Turn on TV",
    "Envia Wake-on-LAN" to "Sends Wake-on-LAN",
    "Diagnóstico de rede" to "Network diagnostics",
    "Reconectar automaticamente" to "Reconnect automatically",
    "Tenta restaurar a conexão sem interromper você" to "Tries to restore the connection without interrupting you",
    "Sistemas experimentais" to "Experimental systems",
    "Permite testar Samsung Tizen e plataformas ainda em validação" to "Allows testing Samsung Tizen and platforms still under validation",
    "CONTROLE" to "REMOTE",
    "Layout" to "Layout",
    "Mostrar nomes dos botões" to "Show button labels",
    "Útil para aprender os ícones" to "Useful for learning the icons",
    "Modo compacto" to "Compact mode",
    "Exibe mais funções em telas pequenas" to "Shows more controls on small screens",
    "Vibração" to "Haptics",
    "Resposta tátil ao tocar" to "Haptic feedback on tap",
    "APARÊNCIA" to "APPEARANCE",
    "Tema" to "Theme",
    "Cor" to "Color",
    "Claro" to "Light",
    "Escuro" to "Dark",
    "Oceano" to "Ocean",
    "Violeta" to "Violet",
    "Esmeralda" to "Emerald",
    "Pôr do sol" to "Sunset",
    "Mono" to "Mono",
    "Aurora" to "Aurora",
    "Rosa" to "Rose",
    "Cyber" to "Cyber",
    "Dourado" to "Gold",
    "Ártico" to "Arctic",
    "IDIOMA E VOZ" to "LANGUAGE & VOICE",
    "Idioma do aplicativo" to "App language",
    "Idioma do microfone" to "Microphone language",
    "Automático" to "Automatic",
    "Português" to "Portuguese",
    "Inglês" to "English",
    "Espanhol" to "Spanish",
    "Francês" to "French",
    "Alemão" to "German",
    "Italiano" to "Italian",
    "ANIMAÇÕES" to "ANIMATIONS",
    "Fundo animado" to "Animated background",
    "Sem animação" to "No animation",
    "Fluxo de gradiente" to "Gradient flow",
    "Orbes ambientes" to "Ambient orbs",
    "Movimento" to "Motion",
    "Desligado" to "Off",
    "Calmo" to "Calm",
    "Fluido" to "Fluid",
    "Energético" to "Energetic",
    "Efeito ao tocar" to "Tap effect",
    "Clássico" to "Classic",
    "Suave" to "Soft",
    "Bounce" to "Bounce",
    "Brilho" to "Glow",
    "PRIVACIDADE E SOBRE" to "PRIVACY & ABOUT",
    "Privacidade" to "Privacy",
    "Sem conta, anúncios, telemetria ou servidor externo" to "No account, ads, telemetry, or external server",
    "Idioma" to "Language",
    "Português, inglês e espanhol; microfone com idiomas adicionais" to "Portuguese, English and Spanish; microphone with additional languages",
    "Editar TV" to "Edit TV",
    "Nome" to "Name",
    "Cômodo" to "Room",
    "MAC para ligar" to "MAC for wake",
    "Esquecer esta TV" to "Forget this TV",
    "Salvar" to "Save",
    "Falar" to "Speak",
    "Microfone" to "Microphone",
    "Fale um comando ou dite um texto" to "Say a command or dictate text",
    "Nenhum app de reconhecimento de voz está disponível neste aparelho." to "No speech recognition app is available on this device.",
    "O texto falado foi enviado para a TV." to "The spoken text was sent to the TV.",
    "A TV atual não aceita entrada de texto; tente um comando de voz." to "The current TV does not accept text input; try a voice command."
)

private val spanish = mapOf(
    "Desligar a TV?" to "¿Apagar el televisor?",
    "Para ligar novamente pelo aplicativo, a TV precisa ter Mobile TV On/Wake-on-LAN ativado." to "Para volver a encenderlo desde la app, Mobile TV On/Wake-on-LAN debe estar activado en el televisor.",
    "Desligar" to "Apagar",
    "Cancelar" to "Cancelar",
    "Reconectar" to "Reconectar",
    "Desligar TV" to "Apagar TV",
    "Ligar TV" to "Encender TV",
    "Configurações" to "Ajustes",
    "Aceite o pedido mostrado na televisão" to "Acepta la solicitud que aparece en el televisor",
    "Seu controle, sem anúncios" to "Tu control, sin anuncios",
    "Conecte a TV uma vez. Nas próximas aberturas, o aplicativo tenta reconectar automaticamente." to "Conecta el televisor una vez. En próximas aperturas, la app intentará reconectarse automáticamente.",
    "Conectar TV" to "Conectar TV",
    "Verificar minha rede" to "Comprobar mi red",
    "O acesso à rede local é necessário somente para localizar e controlar a TV." to "El acceso a la red local solo es necesario para encontrar y controlar el televisor.",
    "Controle" to "Control",
    "Touchpad" to "Touchpad",
    "Pronto para usar" to "Listo para usar",
    "Os botões serão ativados após a conexão" to "Los botones se activarán después de la conexión",
    "Editar" to "Editar",
    "Abrir teclado numérico" to "Abrir teclado numérico",
    "Avançado AL" to "Avanzado AL",
    "Tudo em um só controle • role do início ao fim" to "Todo en un solo control • desplázate de principio a fin",
    "Preset" to "Preset",
    "Navegação" to "Navegación",
    "Sistema" to "Sistema",
    "Volume e canais" to "Volumen y canales",
    "Reprodução" to "Reproducción",
    "Mousepad / touchpad" to "Mousepad / touchpad",
    "Botões coloridos" to "Botones de colores",
    "Info e ajustes da TV" to "Info y ajustes del TV",
    "Conexão" to "Conexión",
    "IP / endereço local da TV" to "IP / dirección local del TV",
    "Conectar" to "Conectar",
    "Buscar TVs" to "Buscar TVs",
    "Reconectar agora" to "Reconectar ahora",
    "MAC para ligar pela rede" to "MAC para encender por red",
    "Salvar MAC" to "Guardar MAC",
    "Entradas" to "Entradas",
    "Aplicativos" to "Aplicaciones",
    "Digitar na TV" to "Escribir en el TV",
    "Texto" to "Texto",
    "Enviar" to "Enviar",
    "Números" to "Números",
    "Mais controles" to "Más controles",
    "Funções avançadas sem poluir o controle principal." to "Funciones avanzadas sin saturar el control principal.",
    "Conectar uma TV" to "Conectar un TV",
    "A busca acontece somente dentro da sua rede local." to "La búsqueda ocurre solo dentro de tu red local.",
    "Procurando TVs…" to "Buscando TVs…",
    "Mantenha a TV ligada durante o primeiro pareamento." to "Mantén el TV encendido durante el primer emparejamiento.",
    "Encontradas agora" to "Encontrados ahora",
    "Salvas" to "Guardados",
    "Minha TV não apareceu" to "Mi TV no apareció",
    "IP da TV" to "IP del TV",
    "O IP manual é um recurso de recuperação. Normalmente basta tocar em Procurar novamente." to "La IP manual es una opción de recuperación. Normalmente basta buscar de nuevo.",
    "Layouts do controle" to "Diseños del control",
    "Escolha um preset ou monte até três controles personalizados." to "Elige un preset o crea hasta tres controles personalizados.",
    "Nome do layout" to "Nombre del diseño",
    "Ordem e conteúdo" to "Orden y contenido",
    "Adicionar controles" to "Añadir controles",
    "Restaurar layout" to "Restaurar diseño",
    "Personalize o controle sem perder a simplicidade." to "Personaliza el control sin perder simplicidad.",
    "DISPOSITIVOS" to "DISPOSITIVOS",
    "TVs conectadas" to "TVs conectados",
    "Nenhuma TV selecionada" to "Ningún TV seleccionado",
    "Nome, cômodo e MAC" to "Nombre, habitación y MAC",
    "Edite os dados desta TV" to "Edita los datos de este TV",
    "Ligar TV" to "Encender TV",
    "Envia Wake-on-LAN" to "Envía Wake-on-LAN",
    "Diagnóstico de rede" to "Diagnóstico de red",
    "Reconectar automaticamente" to "Reconectar automáticamente",
    "Tenta restaurar a conexão sem interromper você" to "Intenta restaurar la conexión sin interrumpirte",
    "Sistemas experimentais" to "Sistemas experimentales",
    "Permite testar Samsung Tizen e plataformas ainda em validação" to "Permite probar Samsung Tizen y plataformas aún en validación",
    "CONTROLE" to "CONTROL",
    "Layout" to "Diseño",
    "Mostrar nomes dos botões" to "Mostrar nombres de los botones",
    "Útil para aprender os ícones" to "Útil para aprender los iconos",
    "Modo compacto" to "Modo compacto",
    "Exibe mais funções em telas pequenas" to "Muestra más funciones en pantallas pequeñas",
    "Vibração" to "Vibración",
    "Resposta tátil ao tocar" to "Respuesta háptica al tocar",
    "APARÊNCIA" to "APARIENCIA",
    "Tema" to "Tema",
    "Cor" to "Color",
    "Claro" to "Claro",
    "Escuro" to "Oscuro",
    "Oceano" to "Océano",
    "Violeta" to "Violeta",
    "Esmeralda" to "Esmeralda",
    "Pôr do sol" to "Atardecer",
    "Mono" to "Mono",
    "Aurora" to "Aurora",
    "Rosa" to "Rosa",
    "Cyber" to "Cyber",
    "Dourado" to "Dorado",
    "Ártico" to "Ártico",
    "IDIOMA E VOZ" to "IDIOMA Y VOZ",
    "Idioma do aplicativo" to "Idioma de la app",
    "Idioma do microfone" to "Idioma del micrófono",
    "Automático" to "Automático",
    "Português" to "Portugués",
    "Inglês" to "Inglés",
    "Espanhol" to "Español",
    "Francês" to "Francés",
    "Alemão" to "Alemán",
    "Italiano" to "Italiano",
    "ANIMAÇÕES" to "ANIMACIONES",
    "Fundo animado" to "Fondo animado",
    "Sem animação" to "Sin animación",
    "Fluxo de gradiente" to "Flujo de gradiente",
    "Orbes ambientes" to "Orbes ambientales",
    "Movimento" to "Movimiento",
    "Desligado" to "Desactivado",
    "Calmo" to "Calmado",
    "Fluido" to "Fluido",
    "Energético" to "Energético",
    "Efeito ao tocar" to "Efecto al tocar",
    "Clássico" to "Clásico",
    "Suave" to "Suave",
    "Bounce" to "Rebote",
    "Brilho" to "Brillo",
    "PRIVACIDADE E SOBRE" to "PRIVACIDAD Y ACERCA DE",
    "Privacidade" to "Privacidad",
    "Sem conta, anúncios, telemetria ou servidor externo" to "Sin cuenta, anuncios, telemetría ni servidor externo",
    "Idioma" to "Idioma",
    "Português, inglês e espanhol; microfone com idiomas adicionais" to "Portugués, inglés y español; micrófono con idiomas adicionales",
    "Editar TV" to "Editar TV",
    "Nome" to "Nombre",
    "Cômodo" to "Habitación",
    "MAC para ligar" to "MAC para encender",
    "Esquecer esta TV" to "Olvidar este TV",
    "Salvar" to "Guardar",
    "Falar" to "Hablar",
    "Microfone" to "Micrófono",
    "Fale um comando ou dite um texto" to "Di un comando o dicta un texto",
    "Nenhum app de reconhecimento de voz está disponível neste aparelho." to "No hay una app de reconocimiento de voz disponible en este dispositivo.",
    "O texto falado foi enviado para a TV." to "El texto hablado fue enviado al TV.",
    "A TV atual não aceita entrada de texto; tente um comando de voz." to "El TV actual no acepta entrada de texto; prueba un comando de voz."
)

fun localize(raw: String, language: AppLanguage): String {
    return when (language.resolved()) {
        AppLanguage.PortugueseBrazil -> raw
        AppLanguage.English -> english[raw] ?: raw
        AppLanguage.Spanish -> spanish[raw] ?: raw
        AppLanguage.System -> raw
    }
}

@Composable
fun tr(raw: String): String = localize(raw, LocalAppLanguage.current)

fun localizeStatus(raw: String, language: AppLanguage): String {
    val resolved = language.resolved()
    if (resolved == AppLanguage.PortugueseBrazil) return raw
    val exact = localize(raw, resolved)
    if (exact != raw) return exact

    return when (resolved) {
        AppLanguage.English -> when {
            raw.startsWith("Conectada a ") -> "Connected to " + raw.removePrefix("Conectada a ")
            raw.startsWith("Conectando a ") -> "Connecting to " + raw.removePrefix("Conectando a ")
            raw.startsWith("Reconectando") -> "Reconnecting…"
            raw.startsWith("Procurando TVs") -> "Looking for TVs and receivers on your network…"
            raw.startsWith("Nenhuma TV compatível") -> "No compatible TV appeared. Check the network or use manual IP."
            raw.startsWith("Encontrada:") -> "Found:" + raw.substringAfter(":")
            raw.startsWith("TV removida") -> "TV removed"
            raw.startsWith("Desconectada") -> "Disconnected"
            else -> raw
        }
        AppLanguage.Spanish -> when {
            raw.startsWith("Conectada a ") -> "Conectado a " + raw.removePrefix("Conectada a ")
            raw.startsWith("Conectando a ") -> "Conectando a " + raw.removePrefix("Conectando a ")
            raw.startsWith("Reconectando") -> "Reconectando…"
            raw.startsWith("Procurando TVs") -> "Buscando TVs y receptores en tu red…"
            raw.startsWith("Nenhuma TV compatível") -> "No apareció un TV compatible. Comprueba la red o usa la IP manual."
            raw.startsWith("Encontrada:") -> "Encontrado:" + raw.substringAfter(":")
            raw.startsWith("TV removida") -> "TV eliminado"
            raw.startsWith("Desconectada") -> "Desconectado"
            else -> raw
        }
        else -> raw
    }
}

fun AppLanguage.displayLabel(): String = when (this) {
    AppLanguage.System -> "Sistema"
    AppLanguage.PortugueseBrazil -> "Português"
    AppLanguage.English -> "Inglês"
    AppLanguage.Spanish -> "Espanhol"
}

fun VoiceLanguage.displayLabel(): String = when (this) {
    VoiceLanguage.Auto -> "Automático"
    VoiceLanguage.PortugueseBrazil -> "Português"
    VoiceLanguage.EnglishUS -> "Inglês"
    VoiceLanguage.Spanish -> "Espanhol"
    VoiceLanguage.French -> "Francês"
    VoiceLanguage.German -> "Alemão"
    VoiceLanguage.Italian -> "Italiano"
}

fun BackgroundEffect.displayLabel(): String = when (this) {
    BackgroundEffect.None -> "Sem animação"
    BackgroundEffect.Aurora -> "Aurora"
    BackgroundEffect.GradientFlow -> "Fluxo de gradiente"
    BackgroundEffect.AmbientOrbs -> "Orbes ambientes"
}

fun AnimationPreset.displayLabel(): String = when (this) {
    AnimationPreset.Off -> "Desligado"
    AnimationPreset.Calm -> "Calmo"
    AnimationPreset.Fluid -> "Fluido"
    AnimationPreset.Energetic -> "Energético"
}

fun ButtonEffect.displayLabel(): String = when (this) {
    ButtonEffect.Classic -> "Clássico"
    ButtonEffect.Soft -> "Suave"
    ButtonEffect.Bounce -> "Bounce"
    ButtonEffect.Glow -> "Brilho"
}
