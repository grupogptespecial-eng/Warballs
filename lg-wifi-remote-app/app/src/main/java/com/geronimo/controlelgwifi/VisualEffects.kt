package com.geronimo.controlelgwifi

import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush

val LocalButtonEffect = staticCompositionLocalOf { ButtonEffect.Soft }
val LocalAnimationPreset = staticCompositionLocalOf { AnimationPreset.Calm }

private fun AnimationPreset.durationMs(): Int = when (this) {
    AnimationPreset.Off -> 120_000
    AnimationPreset.Calm -> 14_000
    AnimationPreset.Fluid -> 8_000
    AnimationPreset.Energetic -> 4_800
}

@Composable
fun AnimatedRemoteBackground(
    effect: BackgroundEffect,
    animation: AnimationPreset,
    modifier: Modifier = Modifier
) {
    if (effect == BackgroundEffect.None) return

    val primary = MaterialTheme.colorScheme.primary
    val secondary = MaterialTheme.colorScheme.secondary
    val tertiary = MaterialTheme.colorScheme.tertiary
    val transition = rememberInfiniteTransition(label = "remote-background")
    val duration = animation.durationMs()
    val phase by transition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(duration),
            repeatMode = RepeatMode.Reverse
        ),
        label = "background-phase"
    )
    val effectivePhase = if (animation == AnimationPreset.Off) 0.45f else phase

    Canvas(modifier = modifier.fillMaxSize()) {
        val w = size.width
        val h = size.height
        when (effect) {
            BackgroundEffect.None -> Unit
            BackgroundEffect.Aurora -> {
                drawCircle(
                    color = primary.copy(alpha = 0.09f),
                    radius = minOf(w, h) * 0.42f,
                    center = Offset(w * (0.18f + effectivePhase * 0.28f), h * 0.18f)
                )
                drawCircle(
                    color = tertiary.copy(alpha = 0.075f),
                    radius = minOf(w, h) * 0.36f,
                    center = Offset(w * (0.82f - effectivePhase * 0.24f), h * 0.56f)
                )
                drawCircle(
                    color = secondary.copy(alpha = 0.06f),
                    radius = minOf(w, h) * 0.28f,
                    center = Offset(w * 0.48f, h * (0.88f - effectivePhase * 0.18f))
                )
            }
            BackgroundEffect.GradientFlow -> {
                drawRect(
                    brush = Brush.linearGradient(
                        colors = listOf(
                            primary.copy(alpha = 0.085f),
                            secondary.copy(alpha = 0.035f),
                            tertiary.copy(alpha = 0.08f)
                        ),
                        start = Offset(w * effectivePhase, 0f),
                        end = Offset(w * (1f - effectivePhase), h)
                    )
                )
            }
            BackgroundEffect.AmbientOrbs -> {
                val radius = minOf(w, h) * 0.14f
                drawCircle(
                    primary.copy(alpha = 0.09f),
                    radius,
                    Offset(w * (0.12f + effectivePhase * 0.68f), h * 0.22f)
                )
                drawCircle(
                    tertiary.copy(alpha = 0.08f),
                    radius * 0.82f,
                    Offset(w * (0.88f - effectivePhase * 0.61f), h * 0.48f)
                )
                drawCircle(
                    secondary.copy(alpha = 0.07f),
                    radius * 0.72f,
                    Offset(w * (0.24f + effectivePhase * 0.42f), h * 0.78f)
                )
            }
        }
    }
}
