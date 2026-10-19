package com.fkucukpala.baglanti

import android.app.Application
import com.fkucukpala.baglanti.core.Puzzle
import com.fkucukpala.baglanti.core.PuzzleParser
import com.fkucukpala.baglanti.data.GameStore
import com.fkucukpala.baglanti.engagement.Reminders
import com.fkucukpala.baglanti.monetization.BillingManager

/** Uygulama genelinde tek örnek olan bileşenler. */
object Graph {
    lateinit var store: GameStore
        private set
    lateinit var puzzles: List<Puzzle>
        private set
    lateinit var billing: BillingManager
        private set

    fun init(app: Application) {
        store = GameStore(app)
        puzzles = app.assets.open("puzzles.json").bufferedReader().use { PuzzleParser.parse(it.readText()) }
        billing = BillingManager(app, store)
    }
}

class BaglantiApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        Graph.init(this)
        Reminders.createChannel(this)
        Graph.billing.start()
    }
}
