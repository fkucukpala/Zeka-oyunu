import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { dateForDay, dayNumber } from '../game';
import { loadAllStatuses, type Status } from '../storage';
import { colors, levelColors } from '../theme';

const BADGE: Record<Status, { label: string; color: string }> = {
  won: { label: 'Çözüldü', color: levelColors[1] },
  lost: { label: 'Çözülemedi', color: colors.border },
  playing: { label: 'Devam ediyor', color: levelColors[0] },
};

export default function ArchiveScreen() {
  const today = dayNumber();
  const days = useMemo(() => Array.from({ length: today }, (_, i) => today - i), [today]);
  const [statuses, setStatuses] = useState<Record<number, Status>>({});

  useFocusEffect(
    useCallback(() => {
      loadAllStatuses(days).then(setStatuses);
    }, [days]),
  );

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={days}
      keyExtractor={(d) => String(d)}
      renderItem={({ item: day }) => {
        const badge = statuses[day] ? BADGE[statuses[day]] : null;
        return (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(`/oyun/${day}`)}
            style={({ pressed }) => [styles.item, pressed && { backgroundColor: colors.tilePressed }]}
          >
            <View>
              <Text style={styles.title}>Bulmaca #{day}</Text>
              <Text style={styles.date}>
                {dateForDay(day).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}
              </Text>
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

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 10 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 10,
    backgroundColor: colors.tile,
  },
  title: { fontSize: 17, fontWeight: '700', color: colors.text },
  date: { fontSize: 14, color: colors.muted, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 13, fontWeight: '600', color: colors.text },
});
