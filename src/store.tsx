import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { isRewardedReady, onRewardedReadyChange, setAdsRemoved, showRewarded } from './ads';
import { HINT_PRODUCTS, HINTS_PER_REWARDED_AD, REMOVE_ADS_PRODUCT } from './config';
import { loadNative } from './native';
import { addHints, getFlag, grantPurchase, loadHintBalance, setFlag, spendHint } from './storage';

type IapLib = typeof import('expo-iap');
type Purchase = import('expo-iap').Purchase;

export interface ShopProduct {
  id: string;
  hints: number;
  price: string;
}

interface StoreState {
  balance: number;
  adsRemoved: boolean;
  /** Mağaza bu derlemede ve cihazda kullanılabilir mi (Expo Go/web'de değil). */
  storeAvailable: boolean;
  hintPacks: ShopProduct[];
  removeAdsPrice: string | null;
  rewardedReady: boolean;
  /** Satın alma akışı süren ürün. */
  buying: string | null;
  lastError: string | null;
  spend: () => Promise<boolean>;
  buy: (productId: string) => Promise<void>;
  restore: () => Promise<void>;
  /** Ödüllü reklam izletir; ödül kazanıldıysa true. */
  watchAdForHint: () => Promise<boolean>;
}

const StoreContext = createContext<StoreState | null>(null);

// eslint-disable-next-line @typescript-eslint/no-require-imports
const iap: IapLib | null = loadNative(() => require('expo-iap') as IapLib);

const hintsFor = (productId: string) => HINT_PRODUCTS.find((p) => p.id === productId)?.hints ?? 0;
const ALL_SKUS = [...HINT_PRODUCTS.map((p) => p.id), REMOVE_ADS_PRODUCT];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(0);
  const [adsRemoved, setAdsRemovedState] = useState(false);
  const [connected, setConnected] = useState(false);
  const [hintPacks, setHintPacks] = useState<ShopProduct[]>([]);
  const [removeAdsPrice, setRemoveAdsPrice] = useState<string | null>(null);
  const [rewardedReady, setRewardedReady] = useState(isRewardedReady);
  const [buying, setBuying] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const markAdsRemoved = useCallback(async () => {
    setAdsRemoved(true);
    setAdsRemovedState(true);
    await setFlag('ads-removed', true);
  }, []);

  // Ödeme onaylanınca önce hakkı kaydet, sonra işlemi tamamla. Tamamlama başarısız olursa
  // satın alma tekrar gelir; grantPurchase ikinci kez eklemez, reklamsız bayrağı zaten açıktır.
  const handlePurchase = useCallback(
    async (purchase: Purchase) => {
      if (!iap || purchase.purchaseState !== 'purchased') return;
      if (purchase.productId === REMOVE_ADS_PRODUCT) {
        await markAdsRemoved();
        await iap.finishTransaction({ purchase, isConsumable: false }).catch(() => {});
        return;
      }
      const hints = hintsFor(purchase.productId);
      if (hints === 0) return;
      const next = await grantPurchase(purchase.purchaseToken ?? purchase.id, hints);
      setBalance(next);
      await iap.finishTransaction({ purchase, isConsumable: true }).catch(() => {});
    },
    [markAdsRemoved],
  );

  useEffect(() => {
    loadHintBalance().then(setBalance);
    getFlag('ads-removed').then((v) => {
      setAdsRemoved(v);
      setAdsRemovedState(v);
    });
    return onRewardedReadyChange(setRewardedReady);
  }, []);

  useEffect(() => {
    if (!iap) return;
    let alive = true;

    const updated = iap.purchaseUpdatedListener((p) => {
      setBuying(null);
      handlePurchase(p);
    });
    const failed = iap.purchaseErrorListener((e) => {
      setBuying(null);
      if (e.code !== iap.ErrorCode.UserCancelled) setLastError('Satın alma tamamlanamadı. Lütfen tekrar dene.');
    });

    (async () => {
      try {
        await iap.initConnection();
        if (!alive) return;
        setConnected(true);
        const found = (await iap.fetchProducts({ skus: ALL_SKUS, type: 'in-app' })) ?? [];
        if (!alive) return;
        setHintPacks(
          HINT_PRODUCTS.flatMap((p) => {
            const prod = found.find((f) => f.id === p.id);
            return prod ? [{ id: p.id, hints: p.hints, price: prod.displayPrice }] : [];
          }),
        );
        setRemoveAdsPrice(found.find((f) => f.id === REMOVE_ADS_PRODUCT)?.displayPrice ?? null);
        // Tamamlanmamış satın almalar ve daha önce alınmış "reklamsız" (yeniden kurulumda geri gelir).
        const owned = await iap.getAvailablePurchases();
        for (const p of owned) await handlePurchase(p);
      } catch {
        if (alive) setConnected(false);
      }
    })();

    return () => {
      alive = false;
      updated.remove();
      failed.remove();
      iap.endConnection().catch(() => {});
    };
  }, [handlePurchase]);

  const spend = useCallback(async () => {
    const res = await spendHint();
    setBalance(res.balance);
    return res.ok;
  }, []);

  const buy = useCallback(async (productId: string) => {
    if (!iap) return;
    setLastError(null);
    setBuying(productId);
    try {
      await iap.requestPurchase({
        request: { apple: { sku: productId }, google: { skus: [productId] } },
        type: 'in-app',
      });
    } catch {
      setBuying(null);
      setLastError('Satın alma başlatılamadı.');
    }
  }, []);

  const restore = useCallback(async () => {
    if (!iap) return;
    setLastError(null);
    try {
      const owned = await iap.getAvailablePurchases();
      for (const p of owned) await handlePurchase(p);
    } catch {
      setLastError('Satın alımlar geri yüklenemedi.');
    }
  }, [handlePurchase]);

  const watchAdForHint = useCallback(async () => {
    const earned = await showRewarded();
    if (earned) setBalance(await addHints(HINTS_PER_REWARDED_AD));
    return earned;
  }, []);

  const value = useMemo<StoreState>(
    () => ({
      balance,
      adsRemoved,
      storeAvailable: !!iap && connected,
      hintPacks,
      removeAdsPrice,
      rewardedReady,
      buying,
      lastError,
      spend,
      buy,
      restore,
      watchAdForHint,
    }),
    [balance, adsRemoved, connected, hintPacks, removeAdsPrice, rewardedReady, buying, lastError, spend, buy, restore, watchAdForHint],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreState {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore, StoreProvider içinde kullanılmalı');
  return ctx;
}
