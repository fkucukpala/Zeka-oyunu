package com.fkucukpala.baglanti

import android.graphics.Color
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.fkucukpala.baglanti.monetization.AdsManager
import com.fkucukpala.baglanti.ui.GameScreen
import com.fkucukpala.baglanti.ui.HomeScreen
import com.fkucukpala.baglanti.ui.HowToScreen
import com.fkucukpala.baglanti.ui.LevelsScreen
import com.fkucukpala.baglanti.ui.ShopScreen
import com.fkucukpala.baglanti.ui.StatsScreen
import com.fkucukpala.baglanti.ui.theme.BaglantiTheme
import com.fkucukpala.baglanti.ui.theme.LocalAppColors

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        AdsManager.init(this)

        setContent {
            val theme by Graph.store.theme.collectAsState()
            BaglantiTheme(theme) {
                val dark = LocalAppColors.current.isDark
                LaunchedEffect(dark) {
                    val style = if (dark) {
                        SystemBarStyle.dark(Color.TRANSPARENT)
                    } else {
                        SystemBarStyle.light(Color.TRANSPARENT, Color.TRANSPARENT)
                    }
                    enableEdgeToEdge(statusBarStyle = style, navigationBarStyle = style)
                }

                val nav = rememberNavController()
                val back: () -> Unit = { nav.popBackStack() }
                val openLevel: (Int) -> Unit = { level ->
                    // Bölümden bölüme geçerken geri tuşu ana sayfaya dönsün diye eski bölüm yığından çıkarılır.
                    nav.navigate("level/$level") { popUpTo("home") }
                }

                NavHost(nav, startDestination = "home") {
                    composable("home") {
                        HomeScreen(
                            onPlay = openLevel,
                            onLevels = { nav.navigate("levels") },
                            onStats = { nav.navigate("stats") },
                            onShop = { nav.navigate("shop") },
                            onHowTo = { nav.navigate("howto") },
                        )
                    }
                    composable("level/{no}", arguments = listOf(navArgument("no") { type = NavType.IntType })) { entry ->
                        GameScreen(
                            level = entry.arguments?.getInt("no") ?: 1,
                            onBack = back,
                            onOpenLevel = openLevel,
                            onShop = { nav.navigate("shop") },
                            onStats = { nav.navigate("stats") },
                        )
                    }
                    composable("levels") { LevelsScreen(onBack = back, onOpen = { nav.navigate("level/$it") }) }
                    composable("stats") { StatsScreen(onBack = back) }
                    composable("howto") { HowToScreen(onBack = back) }
                    composable("shop") { ShopScreen(onBack = back) }
                }
            }
        }
    }
}
