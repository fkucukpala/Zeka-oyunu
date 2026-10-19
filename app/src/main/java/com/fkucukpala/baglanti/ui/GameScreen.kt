package com.fkucukpala.baglanti.ui

import androidx.activity.compose.LocalActivity
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.fkucukpala.baglanti.Graph
import com.fkucukpala.baglanti.core.Game
import com.fkucukpala.baglanti.core.Status
import com.fkucukpala.baglanti.engagement.Review
import com.fkucukpala.baglanti.monetization.AdsManager
import com.fkucukpala.baglanti.ui.theme.LocalAppColors
import kotlin.math.roundToInt

private val GAP = 8.dp

@Composable
fun GameScreen(level: Int, onBack: () -> Unit, onOpenLevel: (Int) -> Unit, onShop: () -> Unit, onStats: () -> Unit) {
    val vm: GameViewModel = viewModel(key = "level-$level") { GameViewModel(level) }
    val s by vm.state.collectAsState()
    val c = LocalAppColors.current
    val activity = LocalActivity.current
    val haptics = LocalHapticFeedback.current
    val hints by Graph.store.hints.collectAsState()

    LaunchedEffect(s.redirectTo) { s.redirectTo?.let(onOpenLevel) }

    val shake = remember { Animatable(0f) }
    LaunchedEffect(s.shakeKey) {
        if (s.shakeKey == 0) return@LaunchedEffect
        for (x in listOf(10f, -10f, 8f, -8f, 4f, 0f)) shake.animateTo(x, tween(50))
    }

    AppScaffold("Bölüm $level", onBack) { mod ->
        BoxWithConstraints(mod.fillMaxWidth().verticalScroll(rememberScrollState()), contentAlignment = Alignment.TopCenter) {
            val boardWidth = minOf(maxWidth, 520.dp) - 32.dp
            val tileSize = (boardWidth - GAP * 3) / 4
            val rowHeight = tileSize * 0.8f
            val p = s.progress
            val finished = p.status != Status.PLAYING

            Column(Modifier.widthIn(max = boardWidth).padding(vertical = 16.dp)) {
                if (s.locked) {
                    EnergyEmpty(onEarned = vm::open)
                    return@Column
                }
                Text(
                    "Ortak noktası olan dörder kelimelik gruplar bul!",
                    color = c.text,
                    fontSize = 15.sp,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth().padding(bottom = 14.dp),
                )

                Box {
                    Column(verticalArrangement = Arrangement.spacedBy(GAP)) {
                        val solved = vm.solvedGroups(p)
                        val shown = if (p.status == Status.LOST) solved + vm.puzzle.groups.filter { it.level !in p.solved } else solved
                        shown.forEach { SolvedGroupBar(it, rowHeight) }
                        if (!finished) {
                            p.hints.filter { it !in p.solved }.forEach { l -> HintCard(vm.puzzle.groups.first { it.level == l }) }
                        }
                        if (s.loaded && p.status != Status.LOST) {
                            val solvedWords = solved.flatMap { it.words }.toSet()
                            val remaining = s.order.filter { it !in solvedWords }
                            Column(
                                verticalArrangement = Arrangement.spacedBy(GAP),
                                modifier = Modifier.offset { IntOffset(shake.value.dp.roundToPx(), 0) },
                            ) {
                                remaining.chunked(4).forEach { row ->
                                    Row(horizontalArrangement = Arrangement.spacedBy(GAP)) {
                                        row.forEach { w ->
                                            WordTile(w, w in s.selected, !finished, tileSize) {
                                                vm.toggle(w)
                                                haptics.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    s.toast?.let {
                        Text(
                            it,
                            color = c.onSelected,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier
                                .align(Alignment.TopCenter)
                                .offset { IntOffset(0, (-6).dp.roundToPx()) }
                                .clip(RoundedCornerShape(8.dp))
                                .background(c.accent)
                                .padding(horizontal = 16.dp, vertical = 10.dp),
                        )
                    }
                }

                if (s.loaded && !finished) {
                    val left = Game.MAX_MISTAKES - p.mistakes
                    Row(
                        Modifier.fillMaxWidth().padding(top = 20.dp),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Text("Kalan hata hakkı:", color = c.text, fontSize = 15.sp)
                        repeat(Game.MAX_MISTAKES) { i ->
                            Box(
                                Modifier
                                    .padding(start = 8.dp)
                                    .size(14.dp)
                                    .clip(CircleShape)
                                    .background(if (i < left) c.selected else c.border),
                            )
                        }
                    }
                    Row(Modifier.fillMaxWidth().padding(top = 20.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        AppButton("Karıştır", vm::shuffle, Modifier.weight(1f))
                        AppButton("Temizle", vm::clearSelection, Modifier.weight(1f), enabled = s.selected.isNotEmpty())
                        AppButton("Gönder", {
                            when (vm.submit()) {
                                SubmitOutcome.CORRECT -> haptics.performHapticFeedback(HapticFeedbackType.Confirm)
                                SubmitOutcome.WRONG -> haptics.performHapticFeedback(HapticFeedbackType.Reject)
                                SubmitOutcome.WON, SubmitOutcome.LOST -> {
                                    haptics.performHapticFeedback(HapticFeedbackType.Confirm)
                                    activity?.let {
                                        // Puanlama penceresi açıldıysa aynı anda bir de reklam göstermeyelim.
                                        val reviewed = vm.state.value.progress.status == Status.WON && Review.maybeAsk(it)
                                        if (!reviewed) AdsManager.showAfterLevel(it)
                                    }
                                }
                                SubmitOutcome.IGNORED -> Unit
                            }
                        }, Modifier.weight(1f), primary = true, enabled = s.selected.size == 4)
                    }
                    AppButton(
                        if (hints > 0) "💡 İpucu al ($hints ipucun var)" else "💡 İpucu kazan (reklam izle veya satın al)",
                        {
                            when (vm.takeHint()) {
                                HintOutcome.NEED_SHOP -> onShop()
                                HintOutcome.OK -> haptics.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                                HintOutcome.NONE -> Unit
                            }
                        },
                        Modifier.fillMaxWidth().padding(top = 12.dp),
                        enabled = vm.hintLeft(),
                        dashed = true,
                    )
                }

                if (finished) {
                    ResultCard(
                        puzzle = vm.puzzle,
                        level = level,
                        won = p.status == Status.WON,
                        guesses = p.guesses,
                        hintsUsed = p.hints.size,
                        onNext = { onOpenLevel(level + 1) },
                        onStats = onStats,
                    )
                }
            }
        }
    }
}
