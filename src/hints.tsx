import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { HINT_PRODUCTS } from './config';
import { loadNative } from './native';
import { grantPurchase, loadHintBalance, spendHint } from './storage';

type IapLib = typeof import('expo-iap');
type Purchase = import('expo-iap').Purchase;

export interface ShopProduct {
  id: string;
  hints: number;
  price: string;
}

interface HintsState {
  balance: number;
  /** Mağaza bu derlemede ve cihazda kullanılabilir mi (Expo Go/web'de değil). */
  storeAvailable: boolean;
  products: ShopProduct[];
  /** Satın alma akışı süren ürün. */
  buying: string | null;
  lastError: string | null;
  spend: () => Promise<boolean>;
  buy: (productId: string) => Promise<void>;
}

const HintsContext = createContext<HintsState | null>(null);

// eslint-disable-next-line @typescript-eslint/no-require-imports
const iap: IapLib | null = loadNative(() => require('expo-iap') as IapLib);

const hintsFor = (productId: string) => HINT_PRODUCTS.find((p) => p.id === productId)?.hints ?? 0;

export function HintsProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(0);
  const [connected, setConnected] = useState(false);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [buying, setBuying] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    loadHintBalance().then(setBalance);
  }, []);

  useEffect(() => {
    if (!iap) return;
    let alive = true;

    // Ödeme onaylanınca ipuçlarını önce kaydet, sonra işlemi tüket (consume).
    // Tüketme başarısız olursa satın alma tekrar gelir ama grantPurchase ikinci kez eklemez.
    const handle = async (purchase: Purchase) => {
      const hints = hintsFor(purchase.productId);
      if (purchase.purchaseState !== 'purchased' || hints === 0) return;
      const key = purchase.purchaseToken ?? purchase.id;
      const next = await grantPurchase(key, hints);
      if (alive) setBalance(next);
      await iap.finishTransaction({ purchase, isConsumable: true }).catch(() => {});
    };

    const updated = iap.purchaseUpdatedListener((p) => {
      setBuying(null);
      handle(p);
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
        const found = await iap.fetchProducts({ skus: HINT_PRODUCTS.map((p) => p.id), type: 'in-app' });
        if (alive && found) {
          setProducts(
            HINT_PRODUCTS.flatMap((p) => {
              const prod = found.find((f) => f.id === p.id);
              return prod ? [{ id: p.id, hints: p.hints, price: prod.displayPrice }] : [];
            }),
          );
        }
        // Önceki oturumda tamamlanmamış satın almalar.
        const pending = await iap.getAvailablePurchases();
        for (const p of pending) await handle(p);
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
  }, []);

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

  const value = useMemo<HintsState>(
    () => ({ balance, storeAvailable: !!iap && connected, products, buying, lastError, spend, buy }),
    [balance, connected, products, buying, lastError, spend, buy],
  );

  return <HintsContext.Provider value={value}>{children}</HintsContext.Provider>;
}

export function useHints(): HintsState {
  const ctx = useContext(HintsContext);
  if (!ctx) throw new Error('useHints, HintsProvider içinde kullanılmalı');
  return ctx;
}
