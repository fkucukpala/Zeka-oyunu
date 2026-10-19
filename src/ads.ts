import {
  AD_DELAY_MS,
  AD_FREE_FIRST_PUZZLES,
  INTERSTITIAL_AD_UNIT,
  MIN_AD_INTERVAL_MS,
  REWARDED_AD_UNIT,
} from './config';
import { loadNative } from './native';
import { bumpFinishedCount } from './storage';

type AdsLib = typeof import('react-native-google-mobile-ads');
type Interstitial = ReturnType<AdsLib['InterstitialAd']['createForAdRequest']>;
type Rewarded = ReturnType<AdsLib['RewardedAd']['createForAdRequest']>;

let lib: AdsLib | null | undefined;
let initStarted = false;
let adsRemoved = false;

let interstitial: Interstitial | null = null;
let interstitialLoaded = false;
let lastShown = 0;

let rewarded: Rewarded | null = null;
let rewardedLoaded = false;
const rewardedListeners = new Set<(ready: boolean) => void>();

function ads(): AdsLib | null {
  if (lib === undefined) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    lib = loadNative(() => require('react-native-google-mobile-ads') as AdsLib);
  }
  return lib;
}

function loadInterstitial(m: AdsLib) {
  interstitialLoaded = false;
  interstitial?.removeAllListeners();
  interstitial = m.InterstitialAd.createForAdRequest(INTERSTITIAL_AD_UNIT);
  interstitial.addAdEventListener(m.AdEventType.LOADED, () => {
    interstitialLoaded = true;
  });
  interstitial.addAdEventListener(m.AdEventType.CLOSED, () => loadInterstitial(m));
  interstitial.addAdEventListener(m.AdEventType.ERROR, () => {
    interstitialLoaded = false;
  });
  interstitial.load();
}

function setRewardedLoaded(v: boolean) {
  rewardedLoaded = v;
  rewardedListeners.forEach((l) => l(v));
}

function loadRewarded(m: AdsLib) {
  setRewardedLoaded(false);
  rewarded?.removeAllListeners();
  rewarded = m.RewardedAd.createForAdRequest(REWARDED_AD_UNIT);
  rewarded.addAdEventListener(m.RewardedAdEventType.LOADED, () => setRewardedLoaded(true));
  rewarded.addAdEventListener(m.AdEventType.ERROR, () => {
    setRewardedLoaded(false);
    // Doluluk olmadığında bir süre sonra tekrar dene.
    setTimeout(() => loadRewarded(m), 60 * 1000);
  });
  rewarded.load();
}

/**
 * Kullanıcı iznini (AB/GDPR için UMP formu) toplar, SDK'yı başlatır ve reklamları
 * önceden yükler. Uygulama açılışında bir kez çağrılır.
 */
export async function initAds(): Promise<void> {
  const m = ads();
  if (!m || initStarted) return;
  initStarted = true;
  try {
    const consent = await m.AdsConsent.gatherConsent().catch(() => null);
    if (consent && !consent.canRequestAds) return;
    await m.default().initialize();
    loadInterstitial(m);
    loadRewarded(m);
  } catch {
    // Reklam altyapısı çalışmazsa oyun reklamsız devam eder.
  }
}

/** "Reklamsız" satın alındığında geçiş reklamları kapanır; ödüllü reklam isteğe bağlı kalır. */
export function setAdsRemoved(value: boolean): void {
  adsRemoved = value;
}

/** Bulmaca bittiğinde çağrılır; uygun bir reklam hazırsa kısa bir gecikmeyle gösterir. */
export async function showAdAfterPuzzle(): Promise<void> {
  const finished = await bumpFinishedCount();
  const m = ads();
  if (!m || !interstitial || adsRemoved) return;
  if (finished <= AD_FREE_FIRST_PUZZLES) return;
  if (Date.now() - lastShown < MIN_AD_INTERVAL_MS) return;
  setTimeout(() => {
    if (!interstitialLoaded || !interstitial || adsRemoved) return;
    lastShown = Date.now();
    interstitialLoaded = false;
    interstitial.show().catch(() => loadInterstitial(m));
  }, AD_DELAY_MS);
}

export function isRewardedReady(): boolean {
  return rewardedLoaded;
}

export function onRewardedReadyChange(listener: (ready: boolean) => void): () => void {
  rewardedListeners.add(listener);
  return () => rewardedListeners.delete(listener);
}

/** Ödüllü reklamı gösterir; kullanıcı ödülü hak ettiyse (sonuna kadar izlediyse) true döner. */
export function showRewarded(): Promise<boolean> {
  const m = ads();
  const ad = rewarded;
  if (!m || !ad || !rewardedLoaded) return Promise.resolve(false);
  return new Promise((resolve) => {
    let earned = false;
    const offEarn = ad.addAdEventListener(m.RewardedAdEventType.EARNED_REWARD, () => {
      earned = true;
    });
    const offClose = ad.addAdEventListener(m.AdEventType.CLOSED, () => {
      offEarn();
      offClose();
      resolve(earned);
      loadRewarded(m);
    });
    setRewardedLoaded(false);
    ad.show().catch(() => {
      offEarn();
      offClose();
      resolve(false);
      loadRewarded(m);
    });
  });
}
