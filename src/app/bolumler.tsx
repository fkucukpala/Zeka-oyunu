import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { loadAllStatuses, loadCurrentLevel, type Status } from '../storage';
import { levelColors, useTheme, useThemedStyles, type Colors } from '../theme';

const BADGE: Record<Status, { label: string; color: string }> = {
  won: { label: 'Çözüldü', color: levelColors[1] },
  lost: { label: 'Çözülemedi', color: '#D9D4C5' },
  playing: { label: 'Devam ediyor', color: levelColors[0] },
};

export default function LevelsScreen() {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const [current, setCurrent] = useState(1);
  const levels = useMemo(() => Array.from({ length: current }, (_, i) => current - i), [current]);
  const [statuses, setStatuses] = useState<Record<number, Status>>({});

  useFocusEffect(
    useCallback(() => {
      loadCurrentLevel().then(async (c) => {
        setCurrent(c);
        setStatuses(await loadAllStatuses(Array.from({ length: c }, (_, i) => i + 1)));
      });
    }, []),
  );

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={levels}
      keyExtractor={(l) => String(l)}
      renderItem={({ item: level }) => {
        const badge = statuses[level] ? BADGE[statuses[level]] : null;
        return (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(`/bolum/${level}`)}
            style={({ pressed }) => [styles.item, pressed && { backgroundColor: colors.tilePressed }]}
          >
            <View>
              <Text style={styles.title}>Bölüm {level}</Text>
              {level === current && !statuses[level] && <Text style={styles.date}>Sıradaki bölüm</Text>}
            </View>
            {badge && (
              <View style={[styles.badge, { backgroundColor: badge.color }]}>
                <Text style={styles.badgeText}>{badge.label}</Text>
              </View>
            )}
          </Pressable>
        );
      }}
    />
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    list: { flex: 1, backgroundColor: c.background },
    content: { padding: 16, gap: 10 },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderRadius: 10,
      backgroundColor: c.tile,
    },
    title: { fontSize: 17, fontWeight: '700', color: c.text },
    date: { fontSize: 14, color: c.muted, marginTop: 2 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeText: { fontSize: 13, fontWeight: '600', color: c.onLevel },
  });
