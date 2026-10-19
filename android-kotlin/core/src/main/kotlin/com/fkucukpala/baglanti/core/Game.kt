// Oyunun saf mantığı: Android'e bağımlı değil, böylece JVM üzerinde test edilebilir.
package com.fkucukpala.baglanti.core

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import java.time.LocalDate
import java.time.temporal.ChronoUnit
import java.util.Locale
import kotlin.math.max
import kotlin.math.min

@Serializable
data class Group(val level: Int, val title: String, val words: List<String>)

@Serializable
data class Puzzle(val id: Int, val groups: List<Group>)

sealed interface GuessResult {
    data class Correct(val group: Group) : GuessResult
    data object OneAway : GuessResult
    data object Wrong : GuessResult
    data object Repeat : GuessResult
}

@Serializable
enum class Status { PLAYING, WON, LOST }

@Serializable
data class Progress(
    val guesses: List<List<String>> = emptyList(),
    val solved: List<Int> = emptyList(),
    val mistakes: Int = 0,
    val status: Status = Status.PLAYING,
    /** İpucu olarak adı açılan grupların seviyeleri. */
    val hints: List<Int> = emptyList(),
)

/** Günlük hak durumu: hangi gün için kaç hak kaldığı. */
@Serializable
data class Energy(val day: Int, val left: Int)

@Serializable
data class Stats(
    val played: Int = 0,
    val won: Int = 0,
    /** Arka arkaya en az bir bölüm kazanılan gün sayısı. */
    val currentStreak: Int = 0,
    val maxStreak: Int = 0,
    /** Seri hesabı için son kazanılan günün numarası. */
    val lastWonDay: Int = 0,
    /** Kazanılan bölümlerde yapılan hata sayısına göre dağılım (0..3). */
    val distribution: List<Int> = List(Game.MAX_MISTAKES) { 0 },
)

object Game {
    const val MAX_MISTAKES = 4

    // Gün sayacının başladığı tarih. Günlük hakların yenilenmesi ve seri hesabı bu sayaçla
    // yapılır; yalnızca iki gün arasındaki farkın önemi var.
    val START_DATE: LocalDate = LocalDate.of(2026, 10, 19)

    private val TR = Locale.forLanguageTag("tr-TR")

    /** Bugünün gün numarası (1'den başlar). Başlangıçtan önceyse 1 döner. */
    fun dayNumber(today: LocalDate = LocalDate.now()): Int =
        max(1, ChronoUnit.DAYS.between(START_DATE, today).toInt() + 1)

    /** Bölüm numarasına (1'den başlar) karşılık gelen bulmaca; havuz bitince başa döner. */
    fun <T> puzzleForLevel(puzzles: List<T>, level: Int): T = puzzles[(level - 1) % puzzles.size]

    fun allWords(p: Puzzle): List<String> = p.groups.flatMap { it.words }

    /**
     * Tohumlu karıştırma (mulberry32): herkes aynı bölümde aynı dizilişi görsün diye.
     * Expo sürümündeki JavaScript karşılığıyla aynı sırayı üretir.
     */
    fun <T> seededShuffle(items: List<T>, seed: Int): List<T> {
        val out = items.toMutableList()
        var s = if (seed == 0) 1 else seed
        fun rand(): Double {
            s += 0x6d2b79f5
            var t = s
            t = (t xor (t ushr 15)) * (t or 1)
            t = t xor (t + (t xor (t ushr 7)) * (t or 61))
            return (t xor (t ushr 14)).toUInt().toDouble() / 4294967296.0
        }
        for (i in out.size - 1 downTo 1) {
            val j = (rand() * (i + 1)).toInt()
            val tmp = out[i]
            out[i] = out[j]
            out[j] = tmp
        }
        return out
    }

    fun evaluateGuess(p: Puzzle, selection: Collection<String>, previous: List<List<String>> = emptyList()): GuessResult {
        require(selection.size == 4) { "Tahmin 4 kelime olmalı" }
        val sel = selection.toSet()
        if (previous.any { it.toSet() == sel }) return GuessResult.Repeat
        for (g in p.groups) {
            val hits = g.words.count { it in sel }
            if (hits == 4) return GuessResult.Correct(g)
            if (hits == 3) return GuessResult.OneAway
        }
        return GuessResult.Wrong
    }

    /** Bir tahmindeki her kelimenin ait olduğu grubun seviyesi. */
    fun guessLevels(p: Puzzle, guess: List<String>): List<Int> =
        guess.map { w -> p.groups.first { w in it.words }.level }

    private val EMOJI = listOf("🟨", "🟩", "🟦", "🟪")

    fun shareText(p: Puzzle, level: Int, guesses: List<List<String>>, hintsUsed: Int = 0): String {
        val header = mutableListOf("Bağlantı", "Bölüm $level")
        if (hintsUsed > 0) header += "💡 $hintsUsed ipucu"
        val rows = guesses.map { g -> guessLevels(p, g).joinToString("") { EMOJI[it] } }
        return (header + rows).joinToString("\n")
    }

    /** Sıradaki ipucu: henüz çözülmemiş ve ipucu verilmemiş en kolay grup; yoksa null. */
    fun nextHint(p: Puzzle, solved: List<Int>, hinted: List<Int>): Group? =
        p.groups.filter { it.level !in solved && it.level !in hinted }.minByOrNull { it.level }

    /** Kayıtlı hak durumunu bugüne göre yorumlar: yeni bir gün başladıysa haklar yenilenir. */
    fun energyForToday(saved: Energy?, today: Int, daily: Int): Energy =
        if (saved == null || saved.day != today) Energy(today, daily) else Energy(today, max(0, saved.left))

    /**
     * Bir bölüm bittiğinde istatistikleri günceller. Seri gün bazlıdır: aynı gün birden çok
     * bölüm kazanmak seriyi bir kez artırır; kaybetmek seriyi bozmaz, bir günü boş geçmek bozar.
     */
    fun applyFinish(s: Stats, today: Int, won: Boolean, mistakes: Int): Stats {
        if (!won) return s.copy(played = s.played + 1)
        val dist = s.distribution.toMutableList()
        dist[min(mistakes, MAX_MISTAKES - 1)] += 1
        var streak = s.currentStreak
        var lastWon = s.lastWonDay
        if (s.lastWonDay != today) {
            streak = if (s.lastWonDay == today - 1) s.currentStreak + 1 else 1
            lastWon = today
        }
        return s.copy(
            played = s.played + 1,
            won = s.won + 1,
            currentStreak = streak,
            maxStreak = max(s.maxStreak, streak),
            lastWonDay = lastWon,
            distribution = dist,
        )
    }

    /** Seri, en son bölüm kazanılan gün dün ya da bugün değilse kopmuştur. */
    fun visibleStreak(s: Stats, today: Int): Int = if (s.lastWonDay >= today - 1) s.currentStreak else 0

    /** Bulmaca verisindeki yapısal hataları döner (boş liste = geçerli). */
    fun validate(p: Puzzle): List<String> {
        val errors = mutableListOf<String>()
        if (p.groups.size != 4) errors += "#${p.id}: 4 grup olmalı"
        if (p.groups.map { it.level }.sorted() != listOf(0, 1, 2, 3)) errors += "#${p.id}: seviyeler 0-3 birer kez olmalı"
        val words = allWords(p)
        if (words.size != 16) errors += "#${p.id}: 16 kelime olmalı"
        val seen = HashSet<String>()
        for (w in words) {
            if (!seen.add(w)) errors += "#${p.id}: tekrar eden kelime $w"
            if (w != w.uppercase(TR)) errors += "#${p.id}: büyük harf olmalı $w"
            if (w.isBlank() || w.trim() != w) errors += "#${p.id}: boşluk hatası \"$w\""
        }
        return errors
    }
}

object PuzzleParser {
    private val json = Json { ignoreUnknownKeys = true }

    fun parse(text: String): List<Puzzle> = json.decodeFromString(text)
}
