package com.fkucukpala.baglanti.ui

import androidx.activity.compose.LocalActivity
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import com.fkucukpala.baglanti.Config
import com.fkucukpala.baglanti.Graph
import com.fkucukpala.baglanti.core.Game
import com.fkucukpala.baglanti.core.Status
import com.fkucukpala.baglanti.data.Flag
import com.fkucukpala.baglanti.data.ThemePref
import com.fkucukpala.baglanti.engagement.Reminders
import com.fkucukpala.baglanti.monetization.AdsManager
import com.fkucukpala.baglanti.ui.theme.LevelColors
import com.fkucukpala.baglanti.ui.theme.LevelNames
import com.fkucukpala.baglanti.ui.theme.LocalAppColors

// ---------------------------------------------------------------- Ana sayfa

@Composable
fun HomeScreen(onPlay: (Int) -> Unit, onLevels: () -> Unit, onStats: () -> Unit, onShop: () -> Unit, onHowTo: () -> Unit) {
    val c = LocalAppColors.current
    val context = LocalContext.current
    val store = Graph.store
    val energy by store.energy.collectAsState()
    val hints by store.hints.collectAsState()
    val theme by store.theme.collectAsState()
    var level by remember { mutableIntStateOf(store.currentLevel) }
    var playing by remember { mutableStateOf(false) }
    var streak by remember { mutableIntStateOf(0) }
    var reminderOn by remember { mutableStateOf(store.getFlag(Flag.REMINDER_ON)) }
    val enableReminder = rememberReminderEnabler { reminderOn = it }

    // Oyundan dönünce bölüm, hak ve seri güncellensin diye her açılışta yeniden okunur.
    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) {
        level = store.currentLevel
        playing = store.loadProgress(level)?.status == Status.PLAYING
        store.refreshEnergy()
        streak = Game.visibleStreak(store.loadStats(), Game.dayNumber())
        reminderOn = store.getFlag(Flag.REMINDER_ON)
    }

    Column(
        Modifier
            .fillMaxSize()
            .background(c.background)
            .statusBarsPadding()
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Spacer(Modifier.height(24.dp))
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            for (row in 0..1) Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                for (col in 0..1) Box(Modifier.size(34.dp).clip(RoundedCornerShape(6.dp)).background(LevelColors[row * 2 + col]))
            }
        }
        Text("Bağlantı", color = c.text, fontSize = 40.sp, fontWeight = FontWeight.Black, modifier = Modifier.padding(top = 16.dp))
        Text(
            "16 kelime, 4 gizli grup. Bağlantıyı bulabilir misin?",
            color = c.text,
            fontSize = 17.sp,
            textAlign = TextAlign.Center,
            modifier = Modifier.widthIn(max = 320.dp).padding(top = 8.dp),
        )
        Text(
            buildAnnotatedString {
                append("⚡ Bugünkü hakkın: ")
                withStyle(SpanStyle(fontWeight = FontWeight.ExtraBold, color = c.text)) { append("$energy") }
                if (energy <= Config.DAILY_ENERGY) append(" / ${Config.DAILY_ENERGY}")
            },
            color = c.muted,
            fontSize = 15.sp,
            modifier = Modifier.padding(top = 24.dp),
        )
        if (streak > 0) Text("🔥 $streak günlük seri", color = c.text, fontSize = 16.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 6.dp))

        Column(Modifier.widthIn(max = 360.dp).fillMaxWidth().padding(top = 28.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            AppButton(if (playing) "Bölüm $level · Devam et" else "Bölüm $level · Oyna", { onPlay(level) }, Modifier.fillMaxWidth(), primary = true)
            AppButton("Bölümler", onLevels, Modifier.fillMaxWidth())
            AppButton("İstatistikler", onStats, Modifier.fillMaxWidth())
            AppButton("💡 İpuçları ($hints)", onShop, Modifier.fillMaxWidth())
            AppButton("Nasıl oynanır?", onHowTo, Modifier.fillMaxWidth())
        }

        Row(
            Modifier
                .padding(top = 24.dp)
                .clickable(role = Role.Switch) {
                    if (reminderOn) {
                        Reminders.disable(context)
                        reminderOn = false
                    } else {
                        enableReminder()
                    }
                }
                .padding(12.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Text("🔔 Günlük hatırlatma", color = c.muted, fontSize = 15.sp)
            Text(if (reminderOn) "Açık" else "Kapalı", color = c.text, fontSize = 15.sp, fontWeight = FontWeight.Bold)
        }

        Row(Modifier.padding(top = 12.dp), verticalAlignment = Alignment.CenterVertically) {
            Text("Tema", color = c.muted, fontSize = 15.sp, modifier = Modifier.padding(end = 12.dp))
            Row(Modifier.clip(RoundedCornerShape(20.dp)).background(c.tile).padding(3.dp)) {
                listOf(ThemePref.SYSTEM to "Sistem", ThemePref.LIGHT to "Açık", ThemePref.DARK to "Koyu").forEach { (pref, label) ->
                    val active = pref == theme
                    Text(
                        label,
                        color = if (active) c.onSelected else c.text,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier
                            .clip(RoundedCornerShape(17.dp))
                            .background(if (active) c.accent else c.tile)
                            .clickable(role = Role.RadioButton) { store.setTheme(pref) }
                            .padding(horizontal = 14.dp, vertical = 8.dp),
                    )
                }
            }
        }
        Spacer(Modifier.height(24.dp))
    }
}

// ---------------------------------------------------------------- Bölümler

@Composable
fun LevelsScreen(onBack: () -> Unit, onOpen: (Int) -> Unit) {
    val c = LocalAppColors.current
    val store = Graph.store
    var current by remember { mutableIntStateOf(store.currentLevel) }
    var statuses by remember { mutableStateOf(emptyMap<Int, Status>()) }
    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) {
        current = store.currentLevel
        statuses = store.statuses(1..current)
    }
    AppScaffold("Bölümler", onBack) { mod ->
        LazyColumn(mod.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            items((current downTo 1).toList(), key = { it }) { level ->
                val status = statuses[level]
                Row(
                    Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(c.tile)
                        .clickable(role = Role.Button) { onOpen(level) }
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Column(Modifier.weight(1f)) {
                        Text("Bölüm $level", color = c.text, fontSize = 17.sp, fontWeight = FontWeight.Bold)
                        if (level == current && status == null) Text("Sıradaki bölüm", color = c.muted, fontSize = 14.sp)
                    }
                    val badge = when (status) {
                        Status.WON -> "Çözüldü" to LevelColors[1]
                        Status.LOST -> "Çözülemedi" to Color(0xFFD9D4C5)
                        Status.PLAYING -> "Devam ediyor" to LevelColors[0]
                        null -> null
                    }
                    badge?.let { (label, color) ->
                        Text(
                            label,
                            color = c.onLevel,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            modifier = Modifier.clip(RoundedCornerShape(12.dp)).background(color).padding(horizontal = 10.dp, vertical = 4.dp),
                        )
                    }
                }
            }
        }
    }
}

// ---------------------------------------------------------------- İstatistikler

@Composable
fun StatsScreen(onBack: () -> Unit) {
    val c = LocalAppColors.current
    val stats = remember { Graph.store.loadStats() }
    val winRate = if (stats.played > 0) stats.won * 100 / stats.played else 0
    val maxBar = maxOf(1, stats.distribution.maxOrNull() ?: 0)
    AppScaffold("İstatistikler", onBack) { mod ->
        Column(mod.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp)) {
            Row(Modifier.fillMaxWidth().padding(bottom = 28.dp)) {
                listOf(
                    "Oynanan bölüm" to stats.played,
                    "Kazanma %" to winRate,
                    "Güncel seri" to Game.visibleStreak(stats, Game.dayNumber()),
                    "En uzun seri" to stats.maxStreak,
                ).forEach { (label, value) ->
                    Column(Modifier.weight(1f), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("$value", color = c.text, fontSize = 30.sp, fontWeight = FontWeight.ExtraBold)
                        Text(label, color = c.muted, fontSize = 12.sp, textAlign = TextAlign.Center)
                    }
                }
            }
            Text("Kazandığın bölümlerde hata sayısı", color = c.text, fontSize = 16.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(bottom = 12.dp))
            stats.distribution.forEachIndexed { mistakes, count ->
                Row(Modifier.fillMaxWidth().padding(bottom = 8.dp), verticalAlignment = Alignment.CenterVertically) {
                    Text("$mistakes", color = c.text, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.widthIn(min = 20.dp))
                    Box(Modifier.weight(1f)) {
                        Box(
                            Modifier
                                .fillMaxWidth(maxOf(0.08f, count.toFloat() / maxBar))
                                .height(26.dp)
                                .clip(RoundedCornerShape(4.dp))
                                .background(if (count > 0) LevelColors[1] else c.border)
                                .padding(end = 8.dp),
                            contentAlignment = Alignment.CenterEnd,
                        ) {
                            Text("$count", color = if (count > 0) c.onLevel else c.text, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
            Text("Seri: arka arkaya en az bir bölüm kazandığın gün sayısı.", color = c.muted, fontSize = 13.sp, modifier = Modifier.padding(top = 16.dp))
        }
    }
}

// ---------------------------------------------------------------- Nasıl oynanır

@Composable
fun HowToScreen(onBack: () -> Unit) {
    val c = LocalAppColors.current
    AppScaffold("Nasıl oynanır?", onBack) { mod ->
        Column(mod.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp)) {
            Text("16 kelimenin içinden ortak bir noktası olan 4 kelimelik grupları bul.", color = c.text, fontSize = 17.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(bottom = 12.dp))
            listOf(
                "4 kelime seç ve “Gönder”e dokun.",
                "Grubu doğru bulursan kelimeler renkli bir şerit olur.",
                "4 hata hakkın var. 3 kelimen doğruysa “Bir eksik!” uyarısı çıkar.",
                "Dikkat: bazı kelimeler birden fazla gruba uyuyor gibi görünür, ama tek doğru çözüm vardır.",
                "Takıldığında “İpucu al” ile bir grubun konusunu öğrenebilirsin.",
                "Her gün ${Config.DAILY_ENERGY} bölüm hakkın olur; her yeni bölüm 1 hak harcar. Hakların bitince reklam izleyerek ${Config.ENERGY_PER_AD} hak daha kazanabilirsin.",
                "Haklar her gece yarısı yenilenir. Yarım bıraktığın bölüme dönmek hak harcamaz.",
            ).forEach { Text("• $it", color = c.text, fontSize = 16.sp, lineHeight = 22.sp, modifier = Modifier.padding(bottom = 8.dp)) }

            Text("Örnekler", color = c.text, fontSize = 17.sp, fontWeight = FontWeight.ExtraBold, modifier = Modifier.padding(top = 20.dp, bottom = 10.dp))
            listOf(Triple(0, "MEYVELER", "ELMA, ARMUT, ERİK, AYVA"), Triple(3, "___ SAATİ", "KUM, DUVAR, KOL, CEP")).forEach { (l, t, w) ->
                Column(
                    Modifier.fillMaxWidth().padding(bottom = 8.dp).clip(RoundedCornerShape(8.dp)).background(LevelColors[l]).padding(14.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Text(t, color = c.onLevel, fontSize = 15.sp, fontWeight = FontWeight.ExtraBold)
                    Text(w, color = c.onLevel, fontSize = 14.sp)
                }
            }

            Text("Renkler zorluğu gösterir", color = c.text, fontSize = 17.sp, fontWeight = FontWeight.ExtraBold, modifier = Modifier.padding(top = 20.dp, bottom = 10.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                LevelNames.forEachIndexed { i, name ->
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(Modifier.size(20.dp).clip(RoundedCornerShape(4.dp)).background(LevelColors[i]))
                        Text(name, color = c.text, fontSize = 15.sp, modifier = Modifier.padding(start = 6.dp))
                    }
                }
            }
        }
    }
}

// ---------------------------------------------------------------- Mağaza

@Composable
fun ShopScreen(onBack: () -> Unit) {
    val c = LocalAppColors.current
    val activity = LocalActivity.current
    val store = Graph.store
    val billing by Graph.billing.state.collectAsState()
    val hints by store.hints.collectAsState()
    val adsRemoved by store.adsRemoved.collectAsState()
    val rewardedReady by AdsManager.rewardedReady.collectAsState()
    var watching by remember { mutableStateOf(false) }
    var rewardMsg by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) { if (billing.connected) Graph.billing.restore() }

    AppScaffold("İpuçları", onBack) { mod ->
        Column(mod.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp)) {
            Column(Modifier.fillMaxWidth().padding(vertical = 12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Text("💡 $hints", color = c.text, fontSize = 44.sp, fontWeight = FontWeight.Black)
                Text("ipucu hakkın var", color = c.muted, fontSize = 15.sp)
            }
            Text(
                "Her ipucu, henüz çözmediğin en kolay grubun konusunu gösterir. Takıldığında kullan, serini koru!",
                color = c.text,
                fontSize = 16.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth().padding(vertical = 16.dp),
            )

            if (rewardedReady && activity != null) {
                AppButton(
                    if (watching) "Reklam açılıyor…" else "🎬 Reklam izle, ${Config.HINTS_PER_REWARDED_AD} ipucu kazan",
                    {
                        watching = true
                        rewardMsg = null
                        AdsManager.showRewarded(activity) { earned ->
                            watching = false
                            if (earned) store.addHints(Config.HINTS_PER_REWARDED_AD)
                            rewardMsg = if (earned) "+${Config.HINTS_PER_REWARDED_AD} ipucu kazandın!" else "Ödül için reklamın sonuna kadar izlenmesi gerekiyor."
                        }
                    },
                    Modifier.fillMaxWidth(),
                    primary = true,
                    enabled = !watching,
                )
            }
            rewardMsg?.let { Text(it, color = c.text, fontWeight = FontWeight.SemiBold, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)) }

            if (!billing.connected) {
                Text(
                    "Satın alma yalnızca uygulamanın Google Play'den yüklenen sürümünde kullanılabilir.",
                    color = c.muted,
                    fontSize = 15.sp,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp).clip(RoundedCornerShape(10.dp)).background(c.tile).padding(16.dp),
                )
            } else {
                Column(Modifier.padding(top = 8.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    billing.hintPacks.forEachIndexed { i, p ->
                        ProductRow(
                            title = "${p.hints} ipucu",
                            badge = when (i) {
                                billing.hintPacks.lastIndex -> "En avantajlı"
                                1 -> "En popüler"
                                else -> null
                            },
                            price = p.price,
                            stripe = LevelColors[i % 4],
                            busy = billing.buying == p.id,
                            enabled = billing.buying == null && activity != null,
                        ) { activity?.let { Graph.billing.buy(it, p.id) } }
                    }
                }
                Text("Reklamsız oyna", color = c.text, fontSize = 17.sp, fontWeight = FontWeight.ExtraBold, modifier = Modifier.padding(top = 28.dp, bottom = 10.dp))
                if (adsRemoved) {
                    Text(
                        "✓ Reklamsız sürüm etkin. Desteğin için teşekkürler!",
                        color = c.text,
                        modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(10.dp)).background(c.tile).padding(16.dp),
                    )
                } else {
                    billing.removeAdsPrice?.let { price ->
                        ProductRow(
                            title = "Reklamları kaldır",
                            subtitle = "Bölüm sonu reklamları bir daha çıkmaz. Tek seferlik ödeme.",
                            price = price,
                            stripe = LevelColors[3],
                            busy = billing.buying == Config.REMOVE_ADS_PRODUCT,
                            enabled = billing.buying == null && activity != null,
                        ) { activity?.let { Graph.billing.buy(it, Config.REMOVE_ADS_PRODUCT) } }
                    }
                }
                Text(
                    "Satın alımları geri yükle",
                    color = c.muted,
                    fontSize = 14.sp,
                    modifier = Modifier.align(Alignment.CenterHorizontally).padding(top = 8.dp).clickable { Graph.billing.restore() }.padding(12.dp),
                )
            }
            billing.error?.let { Text(it, color = Color(0xFFD9534F), textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth().padding(top = 14.dp)) }
            Text(
                "İpuçları bu cihazda saklanır. Ödemeler Google Play üzerinden alınır.",
                color = c.muted,
                fontSize = 13.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth().padding(top = 24.dp),
            )
        }
    }
}

@Composable
private fun ProductRow(
    title: String,
    price: String,
    stripe: Color,
    busy: Boolean,
    enabled: Boolean,
    subtitle: String? = null,
    badge: String? = null,
    onClick: () -> Unit,
) {
    val c = LocalAppColors.current
    Row(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(10.dp))
            .background(c.tile)
            .clickable(enabled = enabled, role = Role.Button, onClick = onClick),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(Modifier.size(width = 6.dp, height = 72.dp).background(stripe))
        Column(Modifier.weight(1f).padding(horizontal = 16.dp, vertical = 12.dp)) {
            Text(title, color = c.text, fontSize = 17.sp, fontWeight = FontWeight.Bold)
            badge?.let { Text(it, color = c.muted, fontSize = 12.sp, fontWeight = FontWeight.Bold) }
            subtitle?.let { Text(it, color = c.muted, fontSize = 13.sp, modifier = Modifier.padding(top = 4.dp)) }
        }
        Text(
            if (busy) "…" else price,
            color = c.onSelected,
            fontSize = 15.sp,
            fontWeight = FontWeight.Bold,
            textAlign = TextAlign.Center,
            modifier = Modifier
                .padding(end = 16.dp)
                .widthIn(min = 84.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(c.accent)
                .padding(horizontal = 12.dp, vertical = 8.dp),
        )
    }
}
