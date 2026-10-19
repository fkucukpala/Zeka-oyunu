import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../components/Button';
import { disableReminder, enableReminder, remindersSupported } from '../engagement';
import { DAILY_ENERGY } from '../config';
import { dayNumber, type Level } from '../game';
import { useStore } from '../store';
import { getFlag, loadAllStatuses, loadCurrentLevel, loadStats, visibleStreak, type Status } from '../storage';
import { levelColors, useTheme, useThemedStyles, type Colors, type ThemePreference } from '../theme';

const LOGO_LEVELS: Level[] = [0, 1, 2, 3];
const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'Sistem' },
  { value: 'light', label: 'Açık' },
  { value: 'dark', label: 'Koyu' },
];

export default function HomeScreen() {
  const styles = useThemedStyles(makeStyles);
  const { preference, setPreference } = useTheme();
  const { balance, energy, refreshEnergy } = useStore();
  const today = dayNumber();
  const [level, setLevel] = useState(1);
  const [status, setStatus] = useState<Status | undefined>();
  const [streak, setStreak] = useState(0);
  const [reminderOn, setReminderOn] = useState(false);

  // Oyundan dönünce bölüm, hak ve seri güncellensin diye her odaklanmada yeniden okunur.
  useFocusEffect(
    useCallback(() => {
      loadCurrentLevel().then(async (l) => {
        setLevel(l);
        setStatus((await loadAllStatuses([l]))[l]);
      });
      refreshEnergy();
      loadStats().then((s) => setStreak(visibleStreak(s, today)));
      getFlag('reminder-on').then(setReminderOn);
    }, [today, refreshEnergy]),
  );

  const playLabel = status === 'playing' ? `Bölüm ${level} · Devam et` : `Bölüm ${level} · Oyna`;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.logo}>
          {LOGO_LEVELS.map((l) => (
            <View key={l} style={[styles.logoCell, { backgroundColor: levelColors[l] }]} />
          ))}
        </View>
        <Text style={styles.title}>Bağlantı</Text>
        <Text style={styles.tagline}>16 kelime, 4 gizli grup. Bağlantıyı bulabilir misin?</Text>

        <Text style={styles.date}>
          ⚡ Bugünkü hakkın: <Text style={styles.energyValue}>{energy}</Text>
          {energy <= DAILY_ENERGY ? ` / ${DAILY_ENERGY}` : ''}
        </Text>
        {streak > 0 && <Text style={styles.streak}>🔥 {streak} günlük seri</Text>}

        <View style={styles.buttons}>
          <Button label={playLabel} variant="primary" onPress={() => router.push(`/bolum/${level}`)} />
          <Button label="Bölümler" onPress={() => router.push('/bolumler')} />
          <Button label="İstatistikler" onPress={() => router.push('/istatistik')} />
          <Button label={`💡 İpuçları (${balance})`} onPress={() => router.push('/magaza')} />
          <Button label="Nasıl oynanır?" onPress={() => router.push('/nasil')} />
        </View>

        {remindersSupported && (
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: reminderOn }}
            onPress={async () => {
              if (reminderOn) {
                await disableReminder();
                setReminderOn(false);
              } else {
                setReminderOn(await enableReminder());
              }
            }}
            style={styles.reminderRow}
          >
            <Text style={styles.themeLabel}>🔔 Günlük hatırlatma</Text>
            <Text style={styles.reminderValue}>{reminderOn ? 'Açık' : 'Kapalı'}</Text>
          </Pressable>
        )}

        <View style={styles.themeRow} accessibilityRole="radiogroup" accessibilityLabel="Tema">
          <Text style={styles.themeLabel}>Tema</Text>
          <View style={styles.segment}>
            {THEME_OPTIONS.map((o) => {
              const active = o.value === preference;
              return (
                <Pressable
                  key={o.value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: active }}
                  onPress={() => setPreference(o.value)}
                  style={[styles.segmentItem, active && styles.segmentActive]}
                >
                  <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{o.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    content: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 24 },
    logo: { flexDirection: 'row', flexWrap: 'wrap', width: 72, gap: 4, marginBottom: 16 },
    logoCell: { width: 34, height: 34, borderRadius: 6 },
    title: { fontSize: 40, fontWeight: '900', color: c.text },
    tagline: { fontSize: 17, color: c.text, textAlign: 'center', marginTop: 8, maxWidth: 320 },
    date: { fontSize: 15, color: c.muted, marginTop: 24 },
    energyValue: { fontWeight: '800', color: c.text },
    streak: { fontSize: 16, fontWeight: '700', color: c.text, marginTop: 6 },
    buttons: { maxWidth: 360, width: '100%', marginTop: 28, gap: 12 },
    themeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 28 },
    themeLabel: { fontSize: 15, color: c.muted },
    reminderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 24, minHeight: 44 },
    reminderValue: { fontSize: 15, fontWeight: '700', color: c.text },
    segment: { flexDirection: 'row', borderRadius: 20, backgroundColor: c.tile, padding: 3 },
    segmentItem: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 17, minHeight: 36, justifyContent: 'center' },
    segmentActive: { backgroundColor: c.accent },
    segmentText: { fontSize: 14, fontWeight: '600', color: c.text },
    segmentTextActive: { color: c.onSelected },
  });
