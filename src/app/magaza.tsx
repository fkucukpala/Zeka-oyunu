import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/Button';
import { HINTS_PER_REWARDED_AD, REMOVE_ADS_PRODUCT } from '../config';
import { useStore } from '../store';
import { levelColors, useTheme, useThemedStyles, type Colors } from '../theme';

export default function ShopScreen() {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const store = useStore();
  const [watching, setWatching] = useState(false);
  const [rewardMsg, setRewardMsg] = useState<string | null>(null);

  const watch = async () => {
    setWatching(true);
    setRewardMsg(null);
    const earned = await store.watchAdForHint();
    setWatching(false);
    setRewardMsg(earned ? `+${HINTS_PER_REWARDED_AD} ipucu kazandın!` : 'Ödül için reklamın sonuna kadar izlenmesi gerekiyor.');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.balanceBox}>
        <Text style={styles.balance}>💡 {store.balance}</Text>
        <Text style={styles.balanceLabel}>ipucu hakkın var</Text>
      </View>

      <Text style={styles.p}>
        Her ipucu, henüz çözmediğin en kolay grubun konusunu gösterir. Takıldığında kullan, serini koru!
      </Text>

      {store.rewardedReady && (
        <Button
          label={watching ? 'Reklam açılıyor…' : `🎬 Reklam izle, ${HINTS_PER_REWARDED_AD} ipucu kazan${store.adsSimulated ? ' (test)' : ''}`}
          variant="primary"
          onPress={watch}
          disabled={watching}
          style={styles.rewarded}
        />
      )}
      {rewardMsg && <Text style={styles.rewardMsg}>{rewardMsg}</Text>}

      {!store.storeAvailable ? (
        <Text style={styles.notice}>
          Satın alma yalnızca uygulamanın Google Play’den yüklenen sürümünde kullanılabilir.
        </Text>
      ) : store.hintPacks.length === 0 ? (
        <ActivityIndicator style={{ marginTop: 24 }} color={colors.text} />
      ) : (
        <View style={styles.list}>
          {store.hintPacks.map((p, i) => (
            <ProductRow
              key={p.id}
              title={`${p.hints} ipucu`}
              badge={i === store.hintPacks.length - 1 ? 'En avantajlı' : i === 1 ? 'En popüler' : undefined}
              price={p.price}
              stripe={levelColors[(i % 4) as 0 | 1 | 2 | 3]}
              busy={store.buying === p.id}
              disabled={store.buying !== null}
              onPress={() => store.buy(p.id)}
            />
          ))}
        </View>
      )}

      {store.storeAvailable && (
        <>
          <Text style={styles.heading}>Reklamsız oyna</Text>
          {store.adsRemoved ? (
            <Text style={styles.owned}>✓ Reklamsız sürüm etkin. Desteğin için teşekkürler!</Text>
          ) : store.removeAdsPrice ? (
            <ProductRow
              title="Reklamları kaldır"
              subtitle="Bulmaca sonu reklamları bir daha çıkmaz. Tek seferlik ödeme."
              price={store.removeAdsPrice}
              stripe={levelColors[3]}
              busy={store.buying === REMOVE_ADS_PRODUCT}
              disabled={store.buying !== null}
              onPress={() => store.buy(REMOVE_ADS_PRODUCT)}
            />
          ) : null}
          <Pressable accessibilityRole="button" onPress={store.restore} style={styles.restore}>
            <Text style={styles.restoreText}>Satın alımları geri yükle</Text>
          </Pressable>
        </>
      )}

      {store.lastError && <Text style={styles.error}>{store.lastError}</Text>}
      <Text style={styles.footnote}>İpuçları bu cihazda saklanır. Ödemeler Google Play üzerinden alınır.</Text>
    </ScrollView>
  );
}

interface RowProps {
  title: string;
  subtitle?: string;
  badge?: string;
  price: string;
  stripe: string;
  busy: boolean;
  disabled: boolean;
  onPress: () => void;
}

function ProductRow({ title, subtitle, badge, price, stripe, busy, disabled, onPress }: RowProps) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${price}`}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.product, { borderLeftColor: stripe }, pressed && { opacity: 0.7 }]}
    >
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={styles.productTitle}>{title}</Text>
        {badge && <Text style={styles.badge}>{badge}</Text>}
        {subtitle && <Text style={styles.productSubtitle}>{subtitle}</Text>}
      </View>
      {busy ? (
        <ActivityIndicator color={colors.onSelected} style={styles.price} />
      ) : (
        <Text style={styles.price}>{price}</Text>
      )}
    </Pressable>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    content: { padding: 20, paddingBottom: 40 },
    balanceBox: { alignItems: 'center', marginVertical: 12 },
    balance: { fontSize: 44, fontWeight: '900', color: c.text },
    balanceLabel: { fontSize: 15, color: c.muted },
    p: { fontSize: 16, color: c.text, textAlign: 'center', marginVertical: 16, lineHeight: 22 },
    rewarded: { marginBottom: 8 },
    rewardMsg: { textAlign: 'center', color: c.text, fontWeight: '600', marginBottom: 12 },
    notice: { fontSize: 15, color: c.muted, textAlign: 'center', backgroundColor: c.tile, padding: 16, borderRadius: 10, marginTop: 8 },
    list: { gap: 10, marginTop: 8 },
    heading: { fontSize: 17, fontWeight: '800', color: c.text, marginTop: 28, marginBottom: 10 },
    owned: { fontSize: 15, color: c.text, backgroundColor: c.tile, padding: 16, borderRadius: 10 },
    product: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderRadius: 10,
      borderLeftWidth: 6,
      backgroundColor: c.tile,
    },
    productTitle: { fontSize: 17, fontWeight: '700', color: c.text },
    productSubtitle: { fontSize: 13, color: c.muted, marginTop: 4 },
    badge: { fontSize: 12, fontWeight: '700', color: c.muted, marginTop: 2 },
    price: {
      minWidth: 84,
      textAlign: 'center',
      fontSize: 15,
      fontWeight: '700',
      color: c.onSelected,
      backgroundColor: c.accent,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      overflow: 'hidden',
    },
    restore: { alignSelf: 'center', padding: 12, marginTop: 8 },
    restoreText: { color: c.muted, textDecorationLine: 'underline', fontSize: 14 },
    error: { color: '#D9534F', textAlign: 'center', marginTop: 14, fontSize: 15 },
    footnote: { fontSize: 13, color: c.muted, textAlign: 'center', marginTop: 24 },
  });
