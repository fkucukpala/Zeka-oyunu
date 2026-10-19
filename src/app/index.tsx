import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../components/Button';
import { dateForDay, dayNumber, type Level } from '../game';
import { loadAllStatuses, loadStats, visibleStreak, type Status } from '../storage';
import { colors, levelColors } from '../theme';

const LOGO_LEVELS: Level[] = [0, 1, 2, 3];

export default function HomeScreen() {
  const today = dayNumber();
  const [status, setStatus] = useState<Status | undefined>();
  const [streak, setStreak] = useState(0);

  // Oyundan dönünce durum ve seri güncellensin diye her odaklanmada yeniden okunur.
  useFocusEffect(
    useCallback(() => {
      loadAllStatuses([today]).then((s) => setStatus(s[today]));
      loadStats().then((s) => setStreak(visibleStreak(s, today)));
    }, [today]),
  );

  const dateLabel = dateForDay(today).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  const playLabel = status === 'playing' ? 'Devam et' : status ? 'Sonucu gör' : 'Bugünün bulmacası';

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.logo}>
          {LOGO_LEVELS.map((l) => (
            <View key={l} style={[styles.logoCell, { backgroundColor: levelColors[l] }]} />
          ))}
        </View>
        <Text style={styles.title}>Bağlantı</Text>
        <Text style={styles.tagline}>16 kelime, 4 gizli grup. Bağlantıyı bulabilir misin?</Text>

        <Text style={styles.date}>
          {dateLabel} · Bulmaca #{today}
        </Text>
        {streak > 0 && <Text style={styles.streak}>🔥 {streak} günlük seri</Text>}

        <View style={styles.buttons}>
          <Button label={playLabel} variant="primary" onPress={() => router.push(`/oyun/${today}`)} />
          <Button label="Arşiv" onPress={() => router.push('/arsiv')} />
          <Button label="İstatistikler" onPress={() => router.push('/istatistik')} />
          <Button label="Nasıl oynanır?" onPress={() => router.push('/nasil')} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  logo: { flexDirection: 'row', flexWrap: 'wrap', width: 72, gap: 4, marginBottom: 16 },
  logoCell: { width: 34, height: 34, borderRadius: 6 },
  title: { fontSize: 40, fontWeight: '900', color: colors.text },
  tagline: { fontSize: 17, color: colors.text, textAlign: 'center', marginTop: 8, maxWidth: 320 },
  date: { fontSize: 15, color: colors.muted, marginTop: 24 },
  streak: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 6 },
  buttons: { maxWidth: 360, width: '100%', marginTop: 28, gap: 12 },
});
