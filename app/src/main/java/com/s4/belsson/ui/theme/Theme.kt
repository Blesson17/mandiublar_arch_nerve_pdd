package com.s4.belsson.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = PrimaryBlueLight,
    secondary = AccentTeal,
    tertiary = WarningAmber,
    background = Color(0xFF0F172A),
    surface = Color(0xFF111827),
    onPrimary = SurfaceWhite,
    onSecondary = SurfaceWhite,
    onTertiary = TextMain,
    onBackground = SurfaceWhite,
    onSurface = SurfaceWhite,
    outline = BorderColor,
)

private val LightColorScheme = lightColorScheme(
    primary = PrimaryBlue,
    secondary = AccentTeal,
    tertiary = WarningAmber,
    background = BackgroundGray,
    surface = SurfaceWhite,
    onPrimary = SurfaceWhite,
    onSecondary = SurfaceWhite,
    onTertiary = TextMain,
    onBackground = TextMain,
    onSurface = TextMain,
    outline = BorderColor,
)

@Composable
fun BelssonTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}