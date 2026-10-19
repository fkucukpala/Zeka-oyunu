import { AD_DELAY_MS, INTERSTITIAL_AD_UNIT, MIN_AD_INTERVAL_MS } from './config';
import { loadNative } from './native';

type AdsLib = typeof import('react-native-google-mobile-ads');
type Interstitial = ReturnType<AdsLib['InterstitialAd']['createForAdRequest']>;

let lib: AdsLib | null | undefined;
let interstitial: Interstitial | null = null;
let loaded = false;
let lastShown = 0;
let initStarted = false;

function ads(): AdsLib | null {
  if (lib === undefined) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    lib = loadNative(() => require('react-native-google-mobile-ads') as AdsLib);
  }
  return lib;
}

function loadInterstitial(m: AdsLib) {
  loaded = false;
  interstitial?.removeAllListeners();
  interstitial = m.InterstitialAd.createForAdRequest(INTERSTITIAL_AD_UNIT);
  interstitial.addAdEventListener(m.AdEventType.LOADED, () => {
    loaded = true;
  });
  interstitial.addAdEventListener(m.AdEventType.CLOSED, () => loadInterstitial(m));
  interstitial.addAdEventListener(m.AdEventType.ERROR, () => {
    loaded = false;
  });
  interstitial.load();
}

/**
 * Kullanıcı iznini (AB/GDPR için UMP formu) toplar, SDK'yı başlatır ve ilk reklamı
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
  } catch {
    // Reklam altyapısı çalışmazsa oyun reklamsız devam eder.
  }
}

/** Bulmaca bittiğinde çağrılır; uygun bir reklam hazırsa kısa bir gecikmeyle gösterir. */
export function showAdAfterPuzzle(): void {
  const m = ads();
  if (!m || !interstitial) return;
  if (Date.now() - lastShown < MIN_AD_INTERVAL_MS) return;
  setTimeout(() => {
    if (!loaded || !interstitial) return;
    lastShown = Date.now();
    loaded = false;
    interstitial.show().catch(() => loadInterstitial(m));
  }, AD_DELAY_MS);
}
