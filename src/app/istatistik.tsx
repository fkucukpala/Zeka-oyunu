import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { dayNumber } from '../game';
import { EMPTY_STATS, loadStats, visibleStreak, type Stats } from '../storage';
import { colors, levelColors } from '../theme';

export default function StatsScreen() {
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);

  useEffect(() => {
    loadStats().then(setStats);
  }, []);

  const winRate = stats.played ? Math.round((stats.won / stats.played) * 100) : 0;
  const maxBar = Math.max(1, ...stats.distribution);
  const tiles = [
    { label: 'Oynanan', value: stats.played },
    { label: 'Kazanma %', value: winRate },
    { label: 'Güncel seri', value: visibleStreak(stats, dayNumber()) },
    { label: 'En uzun seri', value: stats.maxStreak },
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.tiles}>
        {tiles.map((t) => (
          <View key={t.label} style={styles.tile}>
            <Text style={styles.value}>{t.value}</Text>
            <Text style={styles.label}>{t.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.heading}>Kazandığın oyunlarda hata sayısı</Text>
      {stats.distribution.map((count, mistakes) => (
        <View key={mistakes} style={styles.barRow}>
          <Text style={styles.barLabel}>{mistakes}</Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.bar,
                { width: `${Math.max(8, (count / maxBar) * 100)}%`, backgroundColor: count ? levelColors[1] : colors.border },
              ]}
            >
              <Text style={styles.barValue}>{count}</Text>
            </View>
          </View>
        </View>
      ))}
      <Text style={styles.note}>Seri yalnızca bulmaca kendi gününde çözüldüğünde artar.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
  tiles: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 },
  tile: { alignItems: 'center', flex: 1 },
  value: { fontSize: 30, fontWeight: '800', color: colors.text },
  label: { fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 2 },
  heading: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  barLabel: { width: 20, fontSize: 15, fontWeight: '600', color: colors.text },
  barTrack: { flex: 1 },
  bar: { height: 26, borderRadius: 4, justifyContent: 'center', alignItems: 'flex-end', paddingRight: 8 },
  barValue: { fontSize: 13, fontWeight: '700', color: colors.text },
  note: { fontSize: 13, color: colors.muted, marginTop: 16 },
});
