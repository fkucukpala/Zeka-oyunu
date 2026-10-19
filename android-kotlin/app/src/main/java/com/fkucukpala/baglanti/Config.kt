package com.fkucukpala.baglanti

/** Oyunun ve gelir modelinin ayarları; hepsi tek yerden değiştirilebilir. */
object Config {
    /** Her gün yenilenen bölüm hakkı. */
    const val DAILY_ENERGY = 10

    /** Ödüllü reklam başına verilen bölüm hakkı. */
    const val ENERGY_PER_AD = 5

    /** Yeni oyuncuya hediye edilen ipucu sayısı. */
    const val WELCOME_HINTS = 3

    /** Ödüllü reklam başına verilen ipucu. */
    const val HINTS_PER_REWARDED_AD = 1

    /**
     * İlk bu kadar bölümde geçiş reklamı gösterilmez: yeni oyuncu oyunu sevmeden
     * reklamla karşılaşırsa geri dönme olasılığı düşer.
     */
    const val AD_FREE_FIRST_PUZZLES = 2

    /** Arka arkaya iki geçiş reklamı arasında en az bu kadar süre geçmeli. */
    const val MIN_AD_INTERVAL_MS = 90_000L

    /** Bölüm bittikten sonra, sonucu görebilsin diye reklamdan önce beklenen süre. */
    const val AD_DELAY_MS = 1_500L

    /** Kaçıncı galibiyetten sonra mağaza puanı istenir (bir kez). */
    const val REVIEW_AFTER_WINS = 3

    /** Günlük hatırlatma bildiriminin saati. */
    const val REMINDER_HOUR = 10

    // AdMob reklam birimi kimlikleri. Şu an Google'ın resmî TEST kimlikleri kullanılıyor;
    // yayından önce AdMob panelindeki kendi kimliklerinle değiştir. Uygulama kimliği
    // AndroidManifest.xml içindedir.
    const val INTERSTITIAL_AD_UNIT = "ca-app-pub-3940256099942544/1033173712"
    const val REWARDED_AD_UNIT = "ca-app-pub-3940256099942544/5224354917"

    // Play Console > Uygulama içi ürünler'de bu kimliklerle ürünler oluştur:
    // ipucu paketleri "tüketilebilir", reklamsız paket tek seferlik olmalı.
    val HINT_PRODUCTS: Map<String, Int> = linkedMapOf("ipucu_5" to 5, "ipucu_15" to 15, "ipucu_40" to 40)
    const val REMOVE_ADS_PRODUCT = "reklamsiz"
}
