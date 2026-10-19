package com.fkucukpala.baglanti.core

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File
import java.time.LocalDate

class GameTest {
    private val puzzles: List<Puzzle> by lazy {
        val path = System.getProperty("puzzles.json") ?: "../app/src/main/assets/puzzles.json"
        PuzzleParser.parse(File(path).readText())
    }

    @Test
    fun `tum bulmacalar yapisal olarak gecerli`() {
        assertTrue(puzzles.size >= 100)
        assertEquals(emptyList<String>(), puzzles.flatMap { Game.validate(it) })
        assertEquals(puzzles.size, puzzles.map { it.id }.toSet().size)
    }

    @Test
    fun `farkli bulmacalarda neredeyse ayni grup yok`() {
        val groups = puzzles.flatMap { p -> p.groups.map { p.id to it } }
        val clashes = mutableListOf<String>()
        for (i in groups.indices) for (j in i + 1 until groups.size) {
            val (ida, a) = groups[i]
            val (idb, b) = groups[j]
            if (ida != idb && a.words.count { it in b.words } >= 3) clashes += "#$ida ${a.title} ~ #$idb ${b.title}"
        }
        assertEquals(emptyList<String>(), clashes)
    }

    @Test
    fun `dayNumber baslangic gununde 1`() {
        assertEquals(1, Game.dayNumber(Game.START_DATE))
        assertEquals(2, Game.dayNumber(Game.START_DATE.plusDays(1)))
        assertEquals(1, Game.dayNumber(LocalDate.of(2000, 1, 1)))
    }

    @Test
    fun `puzzleForLevel havuz bitince basa doner`() {
        assertEquals(puzzles[0], Game.puzzleForLevel(puzzles, 1))
        assertEquals(puzzles[0], Game.puzzleForLevel(puzzles, puzzles.size + 1))
    }

    @Test
    fun `evaluateGuess dogru, bir eksik, yanlis ve tekrar`() {
        val p = puzzles[0]
        val (a, b) = p.groups
        assertTrue(Game.evaluateGuess(p, a.words) is GuessResult.Correct)
        assertEquals(GuessResult.OneAway, Game.evaluateGuess(p, a.words.take(3) + b.words[0]))
        val wrong = a.words.take(2) + b.words.take(2)
        assertEquals(GuessResult.Wrong, Game.evaluateGuess(p, wrong))
        assertEquals(GuessResult.Repeat, Game.evaluateGuess(p, wrong.reversed(), listOf(wrong)))
    }

    @Test
    fun `seededShuffle sabit bir sira uretir`() {
        val items = (0 until 16).toList()
        // Beklenen değerler projenin ilk (Expo/JavaScript) sürümündeki karıştırmadan alındı;
        // böylece bölümlerin kelime dizilişi sürümler arasında değişmez.
        assertEquals(listOf(14, 6, 5, 3, 4, 7, 1, 11, 8, 0, 10, 9, 13, 15, 12, 2), Game.seededShuffle(items, 7919 + 1))
        assertEquals(listOf(12, 7, 0, 15, 4, 1, 3, 14, 10, 13, 5, 2, 8, 11, 6, 9), Game.seededShuffle(items, 42))
    }

    @Test
    fun `shareText seviye emojilerini ve ipucunu yazar`() {
        val p = puzzles[0]
        assertEquals("Bağlantı\nBölüm 7\n🟨🟨🟨🟨\n🟪🟪🟪🟪", Game.shareText(p, 7, listOf(p.groups[0].words, p.groups[3].words)))
        assertEquals("Bağlantı\nBölüm 3\n💡 2 ipucu\n🟩🟩🟩🟩", Game.shareText(p, 3, listOf(p.groups[1].words), 2))
    }

    @Test
    fun `nextHint en kolay acilmamis grubu doner`() {
        val p = puzzles[0]
        assertEquals(0, Game.nextHint(p, emptyList(), emptyList())?.level)
        assertEquals(2, Game.nextHint(p, listOf(0), listOf(1))?.level)
        assertNull(Game.nextHint(p, listOf(0, 1, 2), listOf(3)))
    }

    @Test
    fun `energyForToday yeni gunde yeniler`() {
        assertEquals(Energy(5, 10), Game.energyForToday(null, 5, 10))
        assertEquals(Energy(5, 3), Game.energyForToday(Energy(5, 3), 5, 10))
        assertEquals(Energy(5, 10), Game.energyForToday(Energy(4, 0), 5, 10))
        assertEquals(Energy(5, 14), Game.energyForToday(Energy(5, 14), 5, 10))
    }

    @Test
    fun `applyFinish seriyi gun bazli sayar`() {
        var s = Game.applyFinish(Stats(), 10, true, 1)
        assertEquals(1, s.currentStreak)
        s = Game.applyFinish(s, 10, true, 0)
        assertEquals(1, s.currentStreak)
        s = Game.applyFinish(s, 10, false, 4)
        assertEquals(1, s.currentStreak)
        assertEquals(3, s.played)
        s = Game.applyFinish(s, 11, true, 2)
        assertEquals(2, s.currentStreak)
        s = Game.applyFinish(s, 13, true, 0)
        assertEquals(1, s.currentStreak)
        assertEquals(2, s.maxStreak)
        assertEquals(listOf(2, 1, 1, 0), s.distribution)
        assertEquals(0, Game.visibleStreak(s, 15))
    }
}
