import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Button } from '../../components/Button';
import { ResultCard } from '../../components/ResultCard';
import { SolvedGroup } from '../../components/SolvedGroup';
import { Tile } from '../../components/Tile';
import {
  allWords,
  dayNumber,
  evaluateGuess,
  MAX_MISTAKES,
  puzzleForDay,
  seededShuffle,
  shuffle,
  type Group,
} from '../../game';
import { errorHaptic, successHaptic, tapHaptic } from '../../haptics';
import { PUZZLES } from '../../puzzles';
import { EMPTY_PROGRESS, loadProgress, recordFinish, saveProgress, type Progress } from '../../storage';
import { colors } from '../../theme';

const GAP = 8;
const MAX_WIDTH = 520;

export default function GameScreen() {
  const params = useLocalSearchParams<{ gun: string }>();
  const today = dayNumber();
  const day = Math.min(today, Math.max(1, Number(params.gun) || today));
  const puzzle = puzzleForDay(PUZZLES, day);

  const { width } = useWindowDimensions();
  const boardWidth = Math.min(width, MAX_WIDTH) - 32;
  const tileSize = (boardWidth - GAP * 3) / 4;
  const rowHeight = tileSize * 0.8;

  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);
  const [loaded, setLoaded] = useState(false);
  const [order, setOrder] = useState(() => seededShuffle(allWords(puzzle), day * 7919 + puzzle.id));
  const [selected, setSelected] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [justSolved, setJustSolved] = useState<number | null>(null);

  const [shake] = useState(() => new Animated.Value(0));
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let alive = true;
    loadProgress(day).then((p) => {
      if (!alive) return;
      setProgress(p);
      setLoaded(true);
    });
    return () => {
      alive = false;
    };
  }, [day]);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const solvedGroups = useMemo(
    () => progress.solved.map((l) => puzzle.groups.find((g) => g.level === l)!),
    [progress.solved, puzzle],
  );
  const solvedWords = useMemo(() => new Set(solvedGroups.flatMap((g) => g.words)), [solvedGroups]);
  const remaining = order.filter((w) => !solvedWords.has(w));
  const finished = progress.status !== 'playing';

  // Kaybedilince çözülemeyen gruplar da sırayla gösterilir.
  const shownGroups: Group[] =
    progress.status === 'lost'
      ? [...solvedGroups, ...puzzle.groups.filter((g) => !progress.solved.includes(g.level))]
      : solvedGroups;

  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  };

  const runShake = () => {
    shake.setValue(0);
    Animated.sequence(
      [10, -10, 8, -8, 4, 0].map((toValue) =>
        Animated.timing(shake, { toValue, duration: 50, useNativeDriver: true }),
      ),
    ).start();
  };

  const toggle = useCallback(
    (word: string) => {
      if (finished) return;
      setSelected((cur) => {
        if (cur.includes(word)) return cur.filter((w) => w !== word);
        if (cur.length >= 4) return cur;
        return [...cur, word];
      });
      tapHaptic();
    },
    [finished],
  );

  const persist = async (next: Progress) => {
    setProgress(next);
    await saveProgress(day, next);
    if (next.status !== 'playing') {
      await recordFinish(day, today, next.status === 'won', next.mistakes);
    }
  };

  const submit = () => {
    if (selected.length !== 4 || finished) return;
    const result = evaluateGuess(puzzle, selected, progress.guesses);
    if (result.kind === 'repeat') {
      showToast('Bunu zaten denedin');
      return;
    }
    const guesses = [...progress.guesses, selected];
    if (result.kind === 'correct') {
      const solved = [...progress.solved, result.group.level];
      successHaptic();
      setJustSolved(result.group.level);
      setSelected([]);
      persist({ ...progress, guesses, solved, status: solved.length === 4 ? 'won' : 'playing' });
      return;
    }
    const mistakes = progress.mistakes + 1;
    errorHaptic();
    runShake();
    if (result.kind === 'oneAway' && mistakes < MAX_MISTAKES) showToast('Bir eksik!');
    persist({ ...progress, guesses, mistakes, status: mistakes >= MAX_MISTAKES ? 'lost' : 'playing' });
    if (mistakes >= MAX_MISTAKES) setSelected([]);
  };

  const rows: string[][] = [];
  for (let i = 0; i < remaining.length; i += 4) rows.push(remaining.slice(i, i + 4));

  return (
    <>
      <Stack.Screen options={{ title: `Bağlantı #${day}` }} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={{ width: boardWidth }}>
          <Text style={styles.hint}>Ortak noktası olan dörder kelimelik gruplar bul!</Text>

          <View style={{ gap: GAP }}>
            {shownGroups.map((g) => (
              <SolvedGroup key={g.level} group={g} height={rowHeight} animate={g.level === justSolved} />
            ))}
            {loaded && progress.status !== 'lost' && (
              <Animated.View style={{ gap: GAP, transform: [{ translateX: shake }] }}>
                {rows.map((row, i) => (
                  <View key={i} style={styles.row}>
                    {row.map((w) => (
                      <Tile
                        key={w}
                        word={w}
                        size={tileSize}
                        selected={selected.includes(w)}
                        disabled={finished}
                        onPress={toggle}
                      />
                    ))}
                  </View>
                ))}
              </Animated.View>
            )}
          </View>

          {toast && (
            <View style={styles.toast} pointerEvents="none">
              <Text style={styles.toastText}>{toast}</Text>
            </View>
          )}

          {loaded && !finished && (
            <>
              <View style={styles.mistakes} accessibilityLabel={`Kalan hata hakkı: ${MAX_MISTAKES - progress.mistakes}`}>
                <Text style={styles.mistakesLabel}>Kalan hata hakkı:</Text>
                {Array.from({ length: MAX_MISTAKES }, (_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, i >= MAX_MISTAKES - progress.mistakes ? styles.dotUsed : null]}
                  />
                ))}
              </View>
              <View style={styles.controls}>
                <Button label="Karıştır" onPress={() => setOrder((o) => shuffle(o))} style={styles.control} />
                <Button
                  label="Temizle"
                  onPress={() => setSelected([])}
                  disabled={selected.length === 0}
                  style={styles.control}
                />
                <Button
                  label="Gönder"
                  variant="primary"
                  onPress={submit}
                  disabled={selected.length !== 4}
                  style={styles.control}
                />
              </View>
            </>
          )}

          {finished && (
            <ResultCard
              puzzle={puzzle}
              day={day}
              isToday={day === today}
              won={progress.status === 'won'}
              guesses={progress.guesses}
            />
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { alignItems: 'center', paddingVertical: 16 },
  hint: { textAlign: 'center', fontSize: 15, color: colors.text, marginBottom: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  toast: {
    position: 'absolute',
    top: -6,
    alignSelf: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  toastText: { color: colors.onSelected, fontWeight: '700', fontSize: 15 },
  mistakes: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 },
  mistakesLabel: { fontSize: 15, color: colors.text, marginRight: 4 },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.selected },
  dotUsed: { backgroundColor: colors.border },
  controls: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 20 },
  control: { flex: 1, paddingHorizontal: 8 },
});
