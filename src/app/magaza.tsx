import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useHints } from '../hints';
import { levelColors, useTheme, useThemedStyles, type Colors } from '../theme';

export default function ShopScreen() {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const { balance, storeAvailable, products, buying, lastError, buy } = useHints();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.balanceBox}>
        <Text style={styles.balance}>💡 {balance}</Text>
        <Text style={styles.balanceLabel}>ipucu hakkın var</Text>
      </View>

      <Text style={styles.p}>
        Her ipucu, henüz çözmediğin en kolay grubun konusunu gösterir. Takıldığında kullan, serini koru!
      </Text>

      {!storeAvailable ? (
        <Text style={styles.notice}>
          Satın alma yalnızca uygulamanın Google Play’den yüklenen sürümünde kullanılabilir.
        </Text>
      ) : products.length === 0 ? (
        <ActivityIndicator style={{ marginTop: 24 }} color={colors.text} />
      ) : (
        <View style={styles.list}>
          {products.map((p, i) => (
            <Pressable
              key={p.id}
              accessibilityRole="button"
              accessibilityLabel={`${p.hints} ipucu, ${p.price}`}
              disabled={buying !== null}
              onPress={() => buy(p.id)}
              style={({ pressed }) => [
                styles.product,
                { borderLeftColor: levelColors[(i % 4) as 0 | 1 | 2 | 3] },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.productTitle}>{p.hints} ipucu</Text>
              {buying === p.id ? (
                <ActivityIndicator color={colors.onSelected} style={styles.price} />
              ) : (
                <Text style={styles.price}>{p.price}</Text>
              )}
            </Pressable>
          ))}
        </View>
      )}

      {lastError && <Text style={styles.error}>{lastError}</Text>}
      <Text style={styles.footnote}>İpuçları bu cihazda saklanır. Ödemeler Google Play üzerinden alınır.</Text>
    </ScrollView>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    content: { padding: 20 },
    balanceBox: { alignItems: 'center', marginVertical: 12 },
    balance: { fontSize: 44, fontWeight: '900', color: c.text },
    balanceLabel: { fontSize: 15, color: c.muted },
    p: { fontSize: 16, color: c.text, textAlign: 'center', marginVertical: 16, lineHeight: 22 },
    notice: { fontSize: 15, color: c.muted, textAlign: 'center', backgroundColor: c.tile, padding: 16, borderRadius: 10 },
    list: { gap: 10 },
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
    error: { color: '#D9534F', textAlign: 'center', marginTop: 14, fontSize: 15 },
    footnote: { fontSize: 13, color: c.muted, textAlign: 'center', marginTop: 24 },
  });
