package com.geronimo.controlelgwifi

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private data class AccentPalette(
    val primary: Color,
    val secondary: Color,
    val tertiary: Color
)

private fun AccentTheme.palette(): AccentPalette = when (this) {
    AccentTheme.Ocean -> AccentPalette(Color(0xFF55C8FF), Color(0xFF6EE7D8), Color(0xFF9E8CFF))
    AccentTheme.Violet -> AccentPalette(Color(0xFFB59CFF), Color(0xFFFF8DD7), Color(0xFF72D5FF))
    AccentTheme.Emerald -> AccentPalette(Color(0xFF59E0A1), Color(0xFF7BD8FF), Color(0xFFC0E36B))
    AccentTheme.Sunset -> AccentPalette(Color(0xFFFF9B73), Color(0xFFFFC857), Color(0xFFE890FF))
    AccentTheme.Monochrome -> AccentPalette(Color(0xFFE2E8F0), Color(0xFFB8C1CC), Color(0xFFF8FAFC))
}

private fun darkScheme(accent: AccentTheme, amoled: Boolean): ColorScheme {
    val p = accent.palette()
    return darkColorScheme(
        primary = p.primary,
        onPrimary = Color(0xFF00131C),
        primaryContainer = p.primary.copy(alpha = 0.22f),
        onPrimaryContainer = Color(0xFFEAF8FF),
        secondary = p.secondary,
        tertiary = p.tertiary,
        background = if (amoled) Color.Black else Color(0xFF090D12),
        onBackground = Color(0xFFF2F5F8),
        surface = if (amoled) Color(0xFF050505) else Color(0xFF10161D),
        onSurface = Color(0xFFF2F5F8),
        surfaceVariant = if (amoled) Color(0xFF151515) else Color(0xFF1B2430),
        onSurfaceVariant = Color(0xFFBCC7D4),
        outline = Color(0xFF6F7C89),
        error = Color(0xFFFFB4AB)
    )
}

private fun lightScheme(accent: AccentTheme): ColorScheme {
    val p = accent.palette()
    return lightColorScheme(
        primary = p.primary.copy(red = p.primary.red * 0.72f, green = p.primary.green * 0.72f, blue = p.primary.blue * 0.72f),
        onPrimary = Color.White,
        primaryContainer = p.primary.copy(alpha = 0.18f).compositeOver(Color.White),
        onPrimaryContainer = Color(0xFF08131A),
        secondary = p.secondary.copy(red = p.secondary.red * 0.66f, green = p.secondary.green * 0.66f, blue = p.secondary.blue * 0.66f),
        tertiary = p.tertiary.copy(red = p.tertiary.red * 0.70f, green = p.tertiary.green * 0.70f, blue = p.tertiary.blue * 0.70f),
        background = Color(0xFFF5F7FA),
        onBackground = Color(0xFF14191F),
        surface = Color.White,
        onSurface = Color(0xFF14191F),
        surfaceVariant = Color(0xFFE8EDF3),
        onSurfaceVariant = Color(0xFF4C5966),
        outline = Color(0xFF7B8794),
        error = Color(0xFFBA1A1A)
    )
}

private fun Color.compositeOver(background: Color): Color {
    val alpha = alpha
    return Color(
        red = red * alpha + background.red * (1f - alpha),
        green = green * alpha + background.green * (1f - alpha),
        blue = blue * alpha + background.blue * (1f - alpha),
        alpha = 1f
    )
}

@Composable
fun LibreRemoteTheme(
    mode: ThemeMode,
    accent: AccentTheme,
    content: @Composable () -> Unit
) {
    val systemDark = isSystemInDarkTheme()
    val dark = when (mode) {
        ThemeMode.System -> systemDark
        ThemeMode.Light -> false
        ThemeMode.Dark, ThemeMode.Amoled -> true
    }
    val colors = if (dark) darkScheme(accent, mode == ThemeMode.Amoled) else lightScheme(accent)
    val view = LocalView.current
    if (!view.isInEditMode) {
        DisposableEffect(dark, colors.background) {
            val window = (view.context as Activity).window
            window.statusBarColor = colors.background.toArgb()
            window.navigationBarColor = colors.background.toArgb()
            WindowCompat.getInsetsController(window, view).apply {
                isAppearanceLightStatusBars = !dark
                isAppearanceLightNavigationBars = !dark && Build.VERSION.SDK_INT >= 26
            }
            onDispose { }
        }
    }
    MaterialTheme(
        colorScheme = colors,
        typography = Typography(),
        content = content
    )
}
