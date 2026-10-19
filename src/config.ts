import { Platform } from 'react-native';

// AdMob reklam birimi kimlikleri. Şu an Google'ın resmî TEST kimlikleri kullanılıyor;
// mağazaya çıkmadan önce AdMob panelindeki kendi kimliklerinle değiştir. Uygulama
// kimlikleri (androidAppId / iosAppId) ise app.json'daki eklenti ayarındadır.
const INTERSTITIAL_IDS = {
  android: 'ca-app-pub-3940256099942544/1033173712',
  ios: 'ca-app-pub-3940256099942544/4411468910',
};

export const INTERSTITIAL_AD_UNIT = Platform.OS === 'ios' ? INTERSTITIAL_IDS.ios : INTERSTITIAL_IDS.android;

/** Arka arkaya iki reklam arasında en az bu kadar süre geçmeli. */
export const MIN_AD_INTERVAL_MS = 90 * 1000;

/** Bulmaca bittikten sonra, sonucu görebilsin diye reklamdan önce beklenen süre. */
export const AD_DELAY_MS = 1500;

// Play Console > Uygulama içi ürünler'de bu kimliklerle "tüketilebilir" ürünler oluştur.
export const HINT_PRODUCTS = [
  { id: 'ipucu_5', hints: 5 },
  { id: 'ipucu_15', hints: 15 },
  { id: 'ipucu_40', hints: 40 },
] as const;
