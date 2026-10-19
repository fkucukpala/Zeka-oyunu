package com.fkucukpala.baglanti.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import com.fkucukpala.baglanti.data.ThemePref

@Immutable
data class AppColors(
    val background: Color,
    val text: Color,
    val muted: Color,
    val tile: Color,
    val tilePressed: Color,
    val selected: Color,
    val onSelected: Color,
    val border: Color,
    val accent: Color,
    /** Renkli grup şeritleri her iki temada da açık renkli; üstlerindeki yazı hep koyu. */
    val onLevel: Color,
    val isDark: Boolean,
)

val LightColors = AppColors(
    background = Color(0xFFFFFDF7),
    text = Color(0xFF1F1E1A),
    muted = Color(0xFF6B6A60),
    tile = Color(0xFFEFEBE0),
    tilePressed = Color(0xFFE2DDCE),
    selected = Color(0xFF5A594E),
    onSelected = Color(0xFFFFFFFF),
    border = Color(0xFFD9D4C5),
    accent = Color(0xFF1F1E1A),
    onLevel = Color(0xFF1F1E1A),
    isDark = false,
)

val DarkColors = AppColors(
    background = Color(0xFF121211),
    text = Color(0xFFF2F0E8),
    muted = Color(0xFFA3A197),
    tile = Color(0xFF2B2A27),
    tilePressed = Color(0xFF3A3935),
    selected = Color(0xFFE8E4D6),
    onSelected = Color(0xFF121211),
    border = Color(0xFF3A3935),
    accent = Color(0xFFF2F0E8),
    onLevel = Color(0xFF1F1E1A),
    isDark = true,
)

/** Zorluk renkleri: 0 kolay (sarı) … 3 çok zor (mor). */
val LevelColors = listOf(Color(0xFFF9DF6D), Color(0xFFA0C35A), Color(0xFFB0C4EF), Color(0xFFBA81C5))
val LevelNames = listOf("Kolay", "Orta", "Zor", "Çok zor")

val LocalAppColors = staticCompositionLocalOf { LightColors }

@Composable
fun BaglantiTheme(pref: ThemePref, content: @Composable () -> Unit) {
    val dark = when (pref) {
        ThemePref.SYSTEM -> isSystemInDarkTheme()
        ThemePref.LIGHT -> false
        ThemePref.DARK -> true
    }
    val c = if (dark) DarkColors else LightColors
    val scheme = if (dark) {
        darkColorScheme(background = c.background, surface = c.background, onBackground = c.text, onSurface = c.text, primary = c.accent, onPrimary = c.onSelected)
    } else {
        lightColorScheme(background = c.background, surface = c.background, onBackground = c.text, onSurface = c.text, primary = c.accent, onPrimary = c.onSelected)
    }
    MaterialTheme(colorScheme = scheme) {
        CompositionLocalProvider(LocalAppColors provides c, content = content)
    }
}
