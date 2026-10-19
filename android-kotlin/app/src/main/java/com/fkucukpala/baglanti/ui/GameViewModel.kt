package com.fkucukpala.baglanti.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.fkucukpala.baglanti.Graph
import com.fkucukpala.baglanti.core.Game
import com.fkucukpala.baglanti.core.Group
import com.fkucukpala.baglanti.core.GuessResult
import com.fkucukpala.baglanti.core.Progress
import com.fkucukpala.baglanti.core.Status
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class GameUiState(
    val loaded: Boolean = false,
    /** Bugünkü haklar bitti, bu bölüme başlanamıyor. */
    val locked: Boolean = false,
    /** Henüz açılmamış bir bölüme gelindiyse yönlendirilecek bölüm. */
    val redirectTo: Int? = null,
    val progress: Progress = Progress(),
    val order: List<String> = emptyList(),
    val selected: List<String> = emptyList(),
    val toast: String? = null,
    val justSolved: Int? = null,
    /** Yanlış tahminde sallanma animasyonunu tetikler. */
    val shakeKey: Int = 0,
)

/** Gönder sonrası arayüzün yapması gerekenler (titreşim, reklam). */
enum class SubmitOutcome { CORRECT, WRONG, WON, LOST, IGNORED }

enum class HintOutcome { OK, NEED_SHOP, NONE }

class GameViewModel(val level: Int) : ViewModel() {
    private val store = Graph.store
    val puzzle = Game.puzzleForLevel(Graph.puzzles, level)

    private val _state = MutableStateFlow(
        GameUiState(order = Game.seededShuffle(Game.allWords(puzzle), level * 7919 + puzzle.id)),
    )
    val state: StateFlow<GameUiState> = _state.asStateFlow()

    private var toastJob: Job? = null

    init {
        open()
    }

    /** Bölümü aç: yarım kalmışsa devam eder, yeniyse 1 hak harcar, hak yoksa kilitli kalır. */
    fun open() {
        val current = store.currentLevel
        if (level > current) {
            _state.update { it.copy(redirectTo = current) }
            return
        }
        val p = store.openLevel(level)
        _state.update { it.copy(loaded = true, locked = p == null, progress = p ?: it.progress) }
    }

    val finished: Boolean get() = _state.value.progress.status != Status.PLAYING

    fun solvedGroups(p: Progress): List<Group> = p.solved.map { l -> puzzle.groups.first { it.level == l } }

    fun toggle(word: String) {
        if (finished) return
        _state.update { s ->
            val sel = when {
                word in s.selected -> s.selected - word
                s.selected.size >= 4 -> s.selected
                else -> s.selected + word
            }
            s.copy(selected = sel)
        }
    }

    fun shuffle() = _state.update { it.copy(order = it.order.shuffled()) }

    fun clearSelection() = _state.update { it.copy(selected = emptyList()) }

    private fun showToast(msg: String) {
        toastJob?.cancel()
        _state.update { it.copy(toast = msg) }
        toastJob = viewModelScope.launch {
            delay(1_800)
            _state.update { it.copy(toast = null) }
        }
    }

    private fun persist(next: Progress) {
        _state.update { it.copy(progress = next) }
        store.saveProgress(level, next)
        if (next.status != Status.PLAYING) {
            store.advanceLevel(level)
            store.recordFinish(next.status == Status.WON, next.mistakes)
        }
    }

    fun submit(): SubmitOutcome {
        val s = _state.value
        if (s.selected.size != 4 || finished) return SubmitOutcome.IGNORED
        val p = s.progress
        val result = Game.evaluateGuess(puzzle, s.selected, p.guesses)
        if (result is GuessResult.Repeat) {
            showToast("Bunu zaten denedin")
            return SubmitOutcome.IGNORED
        }
        val guesses = p.guesses + listOf(s.selected)
        if (result is GuessResult.Correct) {
            val solved = p.solved + result.group.level
            val won = solved.size == 4
            _state.update { it.copy(selected = emptyList(), justSolved = result.group.level) }
            persist(p.copy(guesses = guesses, solved = solved, status = if (won) Status.WON else Status.PLAYING))
            return if (won) SubmitOutcome.WON else SubmitOutcome.CORRECT
        }
        val mistakes = p.mistakes + 1
        val lost = mistakes >= Game.MAX_MISTAKES
        if (result is GuessResult.OneAway && !lost) showToast("Bir eksik!")
        _state.update { it.copy(shakeKey = it.shakeKey + 1, selected = if (lost) emptyList() else it.selected) }
        persist(p.copy(guesses = guesses, mistakes = mistakes, status = if (lost) Status.LOST else Status.PLAYING))
        return if (lost) SubmitOutcome.LOST else SubmitOutcome.WRONG
    }

    fun hintLeft(): Boolean {
        val p = _state.value.progress
        return !finished && Game.nextHint(puzzle, p.solved, p.hints) != null
    }

    fun takeHint(): HintOutcome {
        val p = _state.value.progress
        val group = Game.nextHint(puzzle, p.solved, p.hints) ?: return HintOutcome.NONE
        if (finished) return HintOutcome.NONE
        if (!store.spendHint()) return HintOutcome.NEED_SHOP
        persist(p.copy(hints = p.hints + group.level))
        return HintOutcome.OK
    }
}
