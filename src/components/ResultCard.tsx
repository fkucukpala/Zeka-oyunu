import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';

import { guessLevels, shareText, type Puzzle } from '../game';
import { colors, levelColors } from '../theme';
import { Button } from './Button';

interface Props {
  puzzle: Puzzle;
  day: number;
  isToday: boolean;
  won: boolean;
  guesses: string[][];
}

function msUntilMidnight(): number {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return next.getTime() - now.getTime();
}

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
}

export function ResultCard({ puzzle, day, isToday, won, guesses }: Props) {
  const [left, setLeft] = useState(msUntilMidnight);

  useEffect(() => {
    if (!isToday) return;
    const id = setInterval(() => setLeft(msUntilMidnight()), 1000);
    return () => clearInterval(id);
  }, [isToday]);

  const share = () => {
    Share.share({ message: shareText(puzzle, day, guesses) }).catch(() => {});
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{won ? 'Tebrikler!' : 'Bir dahaki sefere!'}</Text>
      <Text style={styles.subtitle}>
        {won ? `Bulmaca #${day} çözüldü.` : `Bulmaca #${day} bu sefer çözülemedi.`}
      </Text>

      <View style={styles.grid} accessibilityLabel="Tahmin geçmişi">
        {guesses.map((g, i) => (
          <View key={i} style={styles.row}>
            {guessLevels(puzzle, g).map((l, j) => (
              <View key={j} style={[styles.square, { backgroundColor: levelColors[l] }]} />
            ))}
          </View>
        ))}
      </View>

      <Button label="Sonucu paylaş" variant="primary" onPress={share} style={styles.button} />
      <Button label="İstatistikler" onPress={() => router.push('/istatistik')} style={styles.button} />

      {isToday && (
        <Text style={styles.countdown}>
          Sonraki bulmaca: <Text style={{ fontWeight: '700' }}>{formatCountdown(left)}</Text>
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', paddingVertical: 16 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 15, color: colors.muted, marginTop: 4, marginBottom: 14 },
  grid: { gap: 4, marginBottom: 18 },
  row: { flexDirection: 'row', gap: 4 },
  square: { width: 28, height: 28, borderRadius: 5 },
  button: { alignSelf: 'stretch', marginBottom: 10 },
  countdown: { marginTop: 6, fontSize: 15, color: colors.muted },
});
