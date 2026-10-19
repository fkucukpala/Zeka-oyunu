package com.fkucukpala.baglanti.data

import android.content.Context
import androidx.core.content.edit
import com.fkucukpala.baglanti.Config
import com.fkucukpala.baglanti.core.Energy
import com.fkucukpala.baglanti.core.Game
import com.fkucukpala.baglanti.core.Progress
import com.fkucukpala.baglanti.core.Stats
import com.fkucukpala.baglanti.core.Status
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.serialization.json.Json
import kotlin.math.max

enum class ThemePref { SYSTEM, LIGHT, DARK }

/** Basit evet/hayır bayrakları. */
enum class Flag(val key: String) {
    REMINDER_ASKED("reminder_asked"),
    REMINDER_ON("reminder_on"),
    REVIEW_ASKED("review_asked"),
}

/**
 * Oyuncunun tüm kalıcı verisi: bölüm ilerlemeleri, istatistik, günlük haklar, ipuçları ve
 * ayarlar. Veri küçük olduğu için SharedPreferences yeterli; arayüzün izlediği değerler
 * StateFlow olarak da sunulur.
 */
class GameStore(context: Context) {
    private val sp = context.getSharedPreferences("baglanti", Context.MODE_PRIVATE)
    private val json = Json { ignoreUnknownKeys = true; encodeDefaults = true }

    private val _energy = MutableStateFlow(loadEnergy().left)
    val energy: StateFlow<Int> = _energy.asStateFlow()

    private val _hints = MutableStateFlow(sp.getInt(K_HINTS, Config.WELCOME_HINTS))
    val hints: StateFlow<Int> = _hints.asStateFlow()

    private val _adsRemoved = MutableStateFlow(sp.getBoolean(K_ADS_REMOVED, false))
    val adsRemoved: StateFlow<Boolean> = _adsRemoved.asStateFlow()

    private val _theme = MutableStateFlow(
        runCatching { ThemePref.valueOf(sp.getString(K_THEME, null) ?: "") }.getOrDefault(ThemePref.SYSTEM),
    )
    val theme: StateFlow<ThemePref> = _theme.asStateFlow()

    // --- Bölümler ---

    /** Bölümün kayıtlı ilerlemesi; hiç başlanmadıysa null. */
    fun loadProgress(level: Int): Progress? =
        sp.getString(progressKey(level), null)?.let { runCatching { json.decodeFromString<Progress>(it) }.getOrNull() }

    fun saveProgress(level: Int, progress: Progress) =
        sp.edit { putString(progressKey(level), json.encodeToString(progress)) }

    fun statuses(levels: IntRange): Map<Int, Status> =
        levels.mapNotNull { l -> loadProgress(l)?.let { l to it.status } }.toMap()

    /** Oyuncunun sıradaki (henüz bitirmediği) bölümü. */
    val currentLevel: Int get() = max(1, sp.getInt(K_LEVEL, 1))

    /** Bir bölüm bitince sıradaki bölümü ilerletir (geriye gitmez). */
    fun advanceLevel(finished: Int) {
        if (finished >= currentLevel) sp.edit { putInt(K_LEVEL, finished + 1) }
    }

    /**
     * Bölümü açar. Daha önce başlanmışsa kayıtlı ilerlemeyi döner (hak harcamaz); yeni
     * başlıyorsa 1 hak harcar. Hak yoksa null döner.
     */
    @Synchronized
    fun openLevel(level: Int): Progress? {
        loadProgress(level)?.let { return it }
        val e = loadEnergy()
        if (e.left <= 0) {
            _energy.value = 0
            return null
        }
        saveEnergy(e.copy(left = e.left - 1))
        return Progress().also { saveProgress(level, it) }
    }

    // --- Günlük haklar ---

    private fun loadEnergy(): Energy {
        val saved = sp.getString(K_ENERGY, null)?.let { runCatching { json.decodeFromString<Energy>(it) }.getOrNull() }
        return Game.energyForToday(saved, Game.dayNumber(), Config.DAILY_ENERGY)
    }

    private fun saveEnergy(e: Energy) {
        sp.edit { putString(K_ENERGY, json.encodeToString(e)) }
        _energy.value = e.left
    }

    /** Gün değişmiş olabilir; hakları yeniden hesaplar. */
    fun refreshEnergy() {
        _energy.value = loadEnergy().left
    }

    @Synchronized
    fun addEnergy(n: Int) {
        val e = loadEnergy()
        saveEnergy(e.copy(left = e.left + n))
    }

    // --- İstatistik ---

    fun loadStats(): Stats =
        sp.getString(K_STATS, null)?.let { runCatching { json.decodeFromString<Stats>(it) }.getOrNull() } ?: Stats()

    fun recordFinish(won: Boolean, mistakes: Int): Stats {
        val next = Game.applyFinish(loadStats(), Game.dayNumber(), won, mistakes)
        sp.edit { putString(K_STATS, json.encodeToString(next)) }
        return next
    }

    /** Bitirilen toplam bölüm sayısını bir artırır, yeni değeri döner. */
    @Synchronized
    fun bumpFinishedCount(): Int {
        val next = sp.getInt(K_FINISHED, 0) + 1
        sp.edit { putInt(K_FINISHED, next) }
        return next
    }

    // --- İpuçları ve satın almalar ---

    private fun setHints(n: Int) {
        sp.edit { putInt(K_HINTS, n) }
        _hints.value = n
    }

    /** Bir ipucu harcar; bakiye yetersizse false döner. */
    @Synchronized
    fun spendHint(): Boolean {
        val n = _hints.value
        if (n <= 0) return false
        setHints(n - 1)
        return true
    }

    @Synchronized
    fun addHints(n: Int) = setHints(_hints.value + n)

    /**
     * Satın alınan ipuçlarını ekler. Aynı satın alma (token) ikinci kez gelirse — örneğin
     * işlem tamamlanmadan uygulama kapanıp yeniden açılırsa — tekrar eklenmez.
     */
    @Synchronized
    fun grantPurchase(token: String, hints: Int) {
        val granted = sp.getStringSet(K_GRANTED, emptySet()).orEmpty()
        if (token in granted) return
        sp.edit { putStringSet(K_GRANTED, granted + token) }
        setHints(_hints.value + hints)
    }

    fun setAdsRemoved() {
        sp.edit { putBoolean(K_ADS_REMOVED, true) }
        _adsRemoved.value = true
    }

    // --- Ayarlar ---

    fun getFlag(flag: Flag): Boolean = sp.getBoolean(flag.key, false)

    fun setFlag(flag: Flag, value: Boolean) = sp.edit { putBoolean(flag.key, value) }

    fun setTheme(pref: ThemePref) {
        sp.edit { putString(K_THEME, pref.name) }
        _theme.value = pref
    }

    private companion object {
        fun progressKey(level: Int) = "progress_$level"
        const val K_LEVEL = "current_level"
        const val K_ENERGY = "energy"
        const val K_STATS = "stats"
        const val K_HINTS = "hints"
        const val K_GRANTED = "granted_purchases"
        const val K_ADS_REMOVED = "ads_removed"
        const val K_THEME = "theme"
        const val K_FINISHED = "finished_count"
    }
}
