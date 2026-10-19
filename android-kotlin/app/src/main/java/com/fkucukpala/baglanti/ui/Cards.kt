package com.fkucukpala.baglanti.ui

import androidx.activity.compose.LocalActivity
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fkucukpala.baglanti.BuildConfig
import com.fkucukpala.baglanti.Config
import com.fkucukpala.baglanti.Graph
import com.fkucukpala.baglanti.core.Game
import com.fkucukpala.baglanti.core.Puzzle
import com.fkucukpala.baglanti.data.Flag
import com.fkucukpala.baglanti.monetization.AdsManager
import com.fkucukpala.baglanti.ui.theme.LevelColors
import com.fkucukpala.baglanti.ui.theme.LocalAppColors

@Composable
fun ResultCard(
    puzzle: Puzzle,
    level: Int,
    won: Boolean,
    guesses: List<List<String>>,
    hintsUsed: Int,
    onNext: () -> Unit,
    onStats: () -> Unit,
) {
    val c = LocalAppColors.current
    val context = LocalContext.current
    val energy by Graph.store.energy.collectAsState()
    Column(Modifier.fillMaxWidth().padding(vertical = 16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        Text(if (won) "Tebrikler!" else "Bir dahaki sefere!", color = c.text, fontSize = 24.sp, fontWeight = FontWeight.ExtraBold)
        Text(
            (if (won) "Bölüm $level tamamlandı." else "Bölüm $level bu sefer çözülemedi.") +
                (if (hintsUsed > 0) " ($hintsUsed ipucu)" else ""),
            color = c.muted,
            fontSize = 15.sp,
            modifier = Modifier.padding(top = 4.dp, bottom = 14.dp),
        )
        Column(verticalArrangement = Arrangement.spacedBy(4.dp), modifier = Modifier.padding(bottom = 18.dp)) {
            guesses.forEach { g ->
                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    Game.guessLevels(puzzle, g).forEach { l ->
                        Box(Modifier.size(28.dp).clip(RoundedCornerShape(5.dp)).background(LevelColors[l]))
                    }
                }
            }
        }
        AppButton("Bölüm ${level + 1} →", onNext, Modifier.fillMaxWidth(), primary = true)
        Text("⚡ Bugün $energy hakkın kaldı", color = c.muted, fontSize = 14.sp, modifier = Modifier.padding(top = 8.dp, bottom = 16.dp))
        ReminderOffer()
        AppButton("Sonucu paylaş", { shareText(context, Game.shareText(puzzle, level, guesses, hintsUsed)) }, Modifier.fillMaxWidth())
        SectionSpacer(10.dp)
        AppButton("İstatistikler", onStats, Modifier.fillMaxWidth())
    }
}

/** Günlük haklar bitince gösterilir: reklam izleyip hak kazanma ya da yarını bekleme. */
@Composable
fun EnergyEmpty(onEarned: () -> Unit) {
    val c = LocalAppColors.current
    val activity = LocalActivity.current
    val ready by AdsManager.rewardedReady.collectAsState()
    val countdown = rememberMidnightCountdown()
    var watching by remember { mutableStateOf(false) }
    var msg by remember { mutableStateOf<String?>(null) }
    // Hata ayıklama derlemesinde, reklam yüklenemeyen ortamlarda (Play hizmetleri olmayan
    // emülatör vb.) akışı deneyebilmek için reklamsız hak verilebilir.
    val testMode = BuildConfig.DEBUG && !ready

    Column(
        Modifier
            .fillMaxWidth()
            .padding(top = 24.dp)
            .clip(RoundedCornerShape(14.dp))
            .background(c.tile)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text("⚡", fontSize = 44.sp)
        Text("Bugünkü hakların bitti", color = c.text, fontSize = 22.sp, fontWeight = FontWeight.ExtraBold, modifier = Modifier.padding(top = 8.dp))
        Text(
            "Her gün ${Config.DAILY_ENERGY} yeni bölüm hakkın olur. Beklemek istemiyorsan kısa bir reklam izleyip hemen ${Config.ENERGY_PER_AD} hak kazanabilirsin.",
            color = c.text,
            fontSize = 15.sp,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(top = 10.dp),
        )
        AppButton(
            when {
                watching -> "Reklam açılıyor…"
                ready -> "🎬 Reklam izle, +${Config.ENERGY_PER_AD} hak"
                testMode -> "Test: reklamsız +${Config.ENERGY_PER_AD} hak"
                else -> "Reklam hazırlanıyor…"
            },
            {
                if (testMode) {
                    Graph.store.addEnergy(Config.ENERGY_PER_AD)
                    onEarned()
                } else if (activity != null) {
                    watching = true
                    msg = null
                    AdsManager.showRewarded(activity) { earned ->
                        watching = false
                        if (earned) {
                            Graph.store.addEnergy(Config.ENERGY_PER_AD)
                            onEarned()
                        } else {
                            msg = "Hak kazanmak için reklamın sonuna kadar izlenmesi gerekiyor."
                        }
                    }
                }
            },
            Modifier.fillMaxWidth().padding(top = 20.dp),
            primary = true,
            enabled = !watching && (ready || testMode),
        )
        msg?.let { Text(it, color = c.muted, fontSize = 14.sp, textAlign = TextAlign.Center, modifier = Modifier.padding(top = 10.dp)) }
        Text(
            buildAnnotatedString {
                append("Yeni haklar: ")
                withStyle(SpanStyle(fontWeight = FontWeight.Bold, color = c.text)) { append(countdown) }
                append(" sonra")
            },
            color = c.muted,
            fontSize = 15.sp,
            modifier = Modifier.padding(top = 16.dp),
        )
    }
}

/**
 * Bölüm sonunda bir kez günlük hatırlatma teklif eder. Sistem izin penceresinden önce kendi
 * sorumuzu sormak, izin verilme oranını belirgin şekilde artırır.
 */
@Composable
fun ReminderOffer() {
    val c = LocalAppColors.current
    var state by remember { mutableStateOf(if (Graph.store.getFlag(Flag.REMINDER_ASKED)) "hidden" else "ask") }
    val enable = rememberReminderEnabler { ok -> state = if (ok) "on" else "denied" }
    when (state) {
        "hidden" -> Unit
        "on", "denied" -> Text(
            if (state == "on") "🔔 Tamam! Her gün ${Config.REMINDER_HOUR}:00'da haber vereceğim."
            else "Bildirim izni verilmedi. İstersen telefon ayarlarından açabilirsin.",
            color = c.muted,
            fontSize = 14.sp,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(bottom = 16.dp),
        )
        else -> Column(
            Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(c.tile)
                .padding(16.dp),
        ) {
            Text("🔔 Haklarını boşa harcama", color = c.text, fontSize = 16.sp, fontWeight = FontWeight.ExtraBold)
            Text(
                "Her gün ${Config.REMINDER_HOUR}:00'da yeni hakların hazır olduğunda haber vereyim mi?",
                color = c.text,
                fontSize = 15.sp,
                modifier = Modifier.padding(top = 6.dp),
            )
            Row(Modifier.padding(top = 14.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                AppButton("Hayır", {
                    Graph.store.setFlag(Flag.REMINDER_ASKED, true)
                    state = "hidden"
                }, Modifier.weight(1f))
                AppButton("Evet, hatırlat", enable, Modifier.weight(1f), primary = true)
            }
        }
    }
}
