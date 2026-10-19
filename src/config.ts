import { Platform } from 'react-native';

// AdMob reklam birimi kimlikleri. Şu an Google'ın resmî TEST kimlikleri kullanılıyor;
// mağazaya çıkmadan önce AdMob panelindeki kendi kimliklerinle değiştir. Uygulama
// kimlikleri (androidAppId / iosAppId) ise app.json'daki eklenti ayarındadır.
const AD_UNITS = {
  android: {
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
    rewarded: 'ca-app-pub-3940256099942544/5224354917',
  },
  ios: {
    interstitial: 'ca-app-pub-3940256099942544/4411468910',
    rewarded: 'ca-app-pub-3940256099942544/1712485313',
  },
};

const units = Platform.OS === 'ios' ? AD_UNITS.ios : AD_UNITS.android;
export const INTERSTITIAL_AD_UNIT = units.interstitial;
export const REWARDED_AD_UNIT = units.rewarded;

/** Arka arkaya iki geçiş reklamı arasında en az bu kadar süre geçmeli. */
export const MIN_AD_INTERVAL_MS = 90 * 1000;

/** Bulmaca bittikten sonra, sonucu görebilsin diye reklamdan önce beklenen süre. */
export const AD_DELAY_MS = 1500;

/**
 * İlk bu kadar bulmacada geçiş reklamı gösterilmez: yeni oyuncu oyunu sevmeden
 * reklamla karşılaşırsa geri dönme olasılığı düşer.
 */
export const AD_FREE_FIRST_PUZZLES = 2;

/** Ödüllü reklam başına verilen ipucu. */
export const HINTS_PER_REWARDED_AD = 1;

/** Kaçıncı galibiyetten sonra mağaza puanı istenir (bir kez). */
export const REVIEW_AFTER_WINS = 3;

/** Günlük hatırlatma bildiriminin saati. */
export const REMINDER_HOUR = 10;

// Play Console > Uygulama içi ürünler'de bu kimliklerle ürünler oluştur:
// ipucu paketleri "tüketilebilir", reklamsız paket "tüketilemez" (tek seferlik) olmalı.
export const HINT_PRODUCTS = [
  { id: 'ipucu_5', hints: 5 },
  { id: 'ipucu_15', hints: 15 },
  { id: 'ipucu_40', hints: 40 },
] as const;

export const REMOVE_ADS_PRODUCT = 'reklamsiz';
