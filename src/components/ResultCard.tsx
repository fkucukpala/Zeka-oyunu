import { router } from 'expo-router';
import { Share, StyleSheet, Text, View } from 'react-native';

import { guessLevels, shareText, type Puzzle } from '../game';
import { useStore } from '../store';
import { levelColors, useThemedStyles, type Colors } from '../theme';
import { Button } from './Button';
import { ReminderOffer } from './ReminderOffer';

interface Props {
  puzzle: Puzzle;
  level: number;
  won: boolean;
  guesses: string[][];
  hintsUsed: number;
}

export function ResultCard({ puzzle, level, won, guesses, hintsUsed }: Props) {
  const styles = useThemedStyles(makeStyles);
  const { energy } = useStore();

  const share = () => {
    Share.share({ message: shareText(puzzle, level, guesses, hintsUsed) }).catch(() => {});
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{won ? 'Tebrikler!' : 'Bir dahaki sefere!'}</Text>
      <Text style={styles.subtitle}>
        {won ? `Bölüm ${level} tamamlandı.` : `Bölüm ${level} bu sefer çözülemedi.`}
        {hintsUsed > 0 ? ` (${hintsUsed} ipucu)` : ''}
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

      <Button
        label={`Bölüm ${level + 1} →`}
        variant="primary"
        onPress={() => router.replace(`/bolum/${level + 1}`)}
        style={styles.button}
      />
      <Text style={styles.energy}>⚡ Bugün {energy} hakkın kaldı</Text>

      <ReminderOffer />

      <Button label="Sonucu paylaş" onPress={share} style={styles.button} />
      <Button label="İstatistikler" onPress={() => router.push('/istatistik')} style={styles.button} />
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    card: { alignItems: 'center', paddingVertical: 16 },
    title: { fontSize: 24, fontWeight: '800', color: c.text },
    subtitle: { fontSize: 15, color: c.muted, marginTop: 4, marginBottom: 14 },
    grid: { gap: 4, marginBottom: 18 },
    row: { flexDirection: 'row', gap: 4 },
    square: { width: 28, height: 28, borderRadius: 5 },
    button: { alignSelf: 'stretch', marginBottom: 10 },
    energy: { fontSize: 14, color: c.muted, marginTop: -2, marginBottom: 16 },
  });
