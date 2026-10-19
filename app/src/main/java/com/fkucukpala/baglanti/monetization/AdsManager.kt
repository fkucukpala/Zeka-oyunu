package com.fkucukpala.baglanti.monetization

import android.app.Activity
import android.content.Context
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import com.fkucukpala.baglanti.Config
import com.fkucukpala.baglanti.Graph
import com.google.android.gms.ads.AdError
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.FullScreenContentCallback
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.MobileAds
import com.google.android.gms.ads.interstitial.InterstitialAd
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback
import com.google.android.gms.ads.rewarded.RewardedAd
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback
import com.google.android.ump.ConsentRequestParameters
import com.google.android.ump.UserMessagingPlatform
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/** AdMob geçiş (bölüm sonu) ve ödüllü reklamları. */
object AdsManager {
    private val handler = Handler(Looper.getMainLooper())
    private lateinit var appContext: Context
    private var started = false

    private var interstitial: InterstitialAd? = null
    private var lastShown = 0L

    private var rewarded: RewardedAd? = null
    private val _rewardedReady = MutableStateFlow(false)
    val rewardedReady: StateFlow<Boolean> = _rewardedReady.asStateFlow()

    /**
     * Kullanıcı iznini (AB/GDPR için UMP formu) toplar, SDK'yı başlatır ve reklamları
     * önceden yükler. Ana ekran açılırken bir kez çağrılır.
     */
    fun init(activity: Activity) {
        appContext = activity.applicationContext
        val consent = UserMessagingPlatform.getConsentInformation(activity)
        consent.requestConsentInfoUpdate(
            activity,
            ConsentRequestParameters.Builder().build(),
            {
                UserMessagingPlatform.loadAndShowConsentFormIfRequired(activity) {
                    if (consent.canRequestAds()) start()
                }
            },
            { if (consent.canRequestAds()) start() },
        )
        // Önceki oturumdan izin varsa beklemeden başla.
        if (consent.canRequestAds()) start()
    }

    private fun start() {
        if (started) return
        started = true
        MobileAds.initialize(appContext) {}
        loadInterstitial()
        loadRewarded()
    }

    private fun loadInterstitial() {
        InterstitialAd.load(
            appContext,
            Config.INTERSTITIAL_AD_UNIT,
            AdRequest.Builder().build(),
            object : InterstitialAdLoadCallback() {
                override fun onAdLoaded(ad: InterstitialAd) {
                    interstitial = ad
                }

                override fun onAdFailedToLoad(error: LoadAdError) {
                    interstitial = null
                }
            },
        )
    }

    private fun loadRewarded() {
        RewardedAd.load(
            appContext,
            Config.REWARDED_AD_UNIT,
            AdRequest.Builder().build(),
            object : RewardedAdLoadCallback() {
                override fun onAdLoaded(ad: RewardedAd) {
                    rewarded = ad
                    _rewardedReady.value = true
                }

                override fun onAdFailedToLoad(error: LoadAdError) {
                    rewarded = null
                    _rewardedReady.value = false
                    // Doluluk olmadığında bir süre sonra tekrar dene.
                    handler.postDelayed({ loadRewarded() }, 60_000L)
                }
            },
        )
    }

    /** Bölüm bittiğinde çağrılır; uygun bir reklam hazırsa kısa bir gecikmeyle gösterir. */
    fun showAfterLevel(activity: Activity) {
        val store = Graph.store
        val finished = store.bumpFinishedCount()
        if (!started || store.adsRemoved.value || finished <= Config.AD_FREE_FIRST_PUZZLES) return
        if (lastShown != 0L && SystemClock.elapsedRealtime() - lastShown < Config.MIN_AD_INTERVAL_MS) return
        handler.postDelayed({
            val ad = interstitial ?: return@postDelayed
            if (store.adsRemoved.value || activity.isFinishing) return@postDelayed
            interstitial = null
            lastShown = SystemClock.elapsedRealtime()
            ad.fullScreenContentCallback = object : FullScreenContentCallback() {
                override fun onAdDismissedFullScreenContent() = loadInterstitial()
                override fun onAdFailedToShowFullScreenContent(error: AdError) = loadInterstitial()
            }
            ad.show(activity)
        }, Config.AD_DELAY_MS)
    }

    /** Ödüllü reklamı gösterir; kullanıcı ödülü hak ettiyse (sonuna kadar izlediyse) true. */
    fun showRewarded(activity: Activity, onResult: (Boolean) -> Unit) {
        val ad = rewarded ?: run {
            onResult(false)
            return
        }
        rewarded = null
        _rewardedReady.value = false
        var earned = false
        ad.fullScreenContentCallback = object : FullScreenContentCallback() {
            override fun onAdDismissedFullScreenContent() {
                onResult(earned)
                loadRewarded()
            }

            override fun onAdFailedToShowFullScreenContent(error: AdError) {
                onResult(false)
                loadRewarded()
            }
        }
        ad.show(activity) { earned = true }
    }
}
