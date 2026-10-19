import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Button } from '../../components/Button';
import { EnergyEmpty } from '../../components/EnergyEmpty';
import { ResultCard } from '../../components/ResultCard';
import { SolvedGroup } from '../../components/SolvedGroup';
import { Tile } from '../../components/Tile';
import {
  allWords,
  evaluateGuess,
  MAX_MISTAKES,
  nextHint,
  puzzleForLevel,
  seededShuffle,
  shuffle,
  type Group,
} from '../../game';
import { showAdAfterPuzzle } from '../../ads';
import { maybeAskForReview } from '../../engagement';
import { errorHaptic, successHaptic, tapHaptic } from '../../haptics';
import { PUZZLES } from '../../puzzles';
import { useStore } from '../../store';
import {
  advanceLevel,
  EMPTY_PROGRESS,
  loadCurrentLevel,
  openLevel,
  recordFinish,
  saveProgress,
  type Progress,
} from '../../storage';
import { levelColors, useThemedStyles, type Colors } from '../../theme';

const GAP = 8;
const MAX_WIDTH = 520;

export default function GameScreen() {
  const styles = useThemedStyles(makeStyles);
  const hints = useStore();
  const { refreshEnergy } = hints;
  const params = useLocalSearchParams<{ no: string }>();
  const level = Math.max(1, Number(params.no) || 1);
  const puzzle = puzzleForLevel(PUZZLES, level);

  const { width } = useWindowDimensions();
  const boardWidth = Math.min(width, MAX_WIDTH) - 32;
  const tileSize = (boardWidth - GAP * 3) / 4;
  const rowHeight = tileSize * 0.8;

  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);
  const [loaded, setLoaded] = useState(false);
  /** Bugünkü haklar bitti, bu bölüme başlanamıyor. */
  const [locked, setLocked] = useState(false);
  const [order, setOrder] = useState(() => seededShuffle(allWords(puzzle), level * 7919 + puzzle.id));
  const [selected, setSelected] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [justSolved, setJustSolved] = useState<number | null>(null);

  const [shake] = useState(() => new Animated.Value(0));
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Hızlı çift dokunuşta iki ipucu harcanmasın.
  const hintBusy = useRef(false);

  // Reklamla hak kazanılınca bölümü yeniden açmayı denemek için artırılır.
  const [retry, setRetry] = useState(0);

  // Bölümü aç: yarım kalmışsa devam eder, yeniyse 1 hak harcar, hak yoksa kilitli kalır.
  useEffect(() => {
    let alive = true;
    (async () => {
      const current = await loadCurrentLevel();
      if (level > current) {
        router.replace(`/bolum/${current}`);
        return;
      }
      const p = await openLevel(level);
      await refreshEnergy();
      if (!alive) return;
      if (p) setProgress(p);
      setLocked(!p);
      setLoaded(true);
    })();
    return () => {
      alive = false;
    };
  }, [level, retry, refreshEnergy]);

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

  // Çözülen grubun ipucu kartı artık gereksiz.
  const openHints = finished
    ? []
    : progress.hints
        .filter((l) => !progress.solved.includes(l))
        .map((l) => puzzle.groups.find((g) => g.level === l)!);
  const hintLeft = !finished && nextHint(puzzle, progress.solved, progress.hints) !== null;

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
    await saveProgress(level, next);
    if (next.status !== 'playing') {
      await advanceLevel(level);
      await recordFinish(next.status === 'won', next.mistakes);
      // Puanlama penceresi açıldıysa aynı anda bir de reklam göstermeyelim.
      if (!(next.status === 'won' && (await maybeAskForReview()))) await showAdAfterPuzzle();
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

  const takeHint = async () => {
    const group = nextHint(puzzle, progress.solved, progress.hints);
    if (!group || finished || hintBusy.current) return;
    hintBusy.current = true;
    try {
      if (hints.balance <= 0 || !(await hints.spend())) {
        router.push('/magaza');
        return;
      }
      tapHaptic();
      await persist({ ...progress, hints: [...progress.hints, group.level] });
    } finally {
      hintBusy.current = false;
    }
  };

  const rows: string[][] = [];
  for (let i = 0; i < remaining.length; i += 4) rows.push(remaining.slice(i, i + 4));

  return (
    <>
      <Stack.Screen options={{ title: `Bölüm ${level}` }} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={{ width: boardWidth }}>
          {locked && <EnergyEmpty onEarned={() => setRetry((r) => r + 1)} />}
          {!locked && <Text style={styles.hint}>Ortak noktası olan dörder kelimelik gruplar bul!</Text>}

          <View style={{ gap: GAP }}>
            {shownGroups.map((g) => (
              <SolvedGroup key={g.level} group={g} height={rowHeight} animate={g.level === justSolved} />
            ))}
            {openHints.map((g) => (
              <View key={g.level} style={[styles.hintCard, { borderLeftColor: levelColors[g.level] }]}>
                <Text style={styles.hintLabel}>💡 Gruplardan biri</Text>
                <Text style={styles.hintTitle}>{g.title.toLocaleUpperCase('tr-TR')}</Text>
              </View>
            ))}
            {loaded && !locked && progress.status !== 'lost' && (
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

          {loaded && !locked && !finished && (
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
              <Button
                label={hints.balance > 0 ? `💡 İpucu al (${hints.balance} ipucun var)` : '💡 İpucu kazan (reklam izle veya satın al)'}
                onPress={takeHint}
                disabled={!hintLeft}
                style={styles.hintButton}
              />
            </>
          )}

          {finished && (
            <ResultCard
              puzzle={puzzle}
              level={level}
              won={progress.status === 'won'}
              guesses={progress.guesses}
              hintsUsed={progress.hints.length}
            />
          )}
        </View>
      </ScrollView>
    </>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    content: { alignItems: 'center', paddingVertical: 16 },
    hint: { textAlign: 'center', fontSize: 15, color: c.text, marginBottom: 14 },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    hintCard: {
      borderLeftWidth: 6,
      borderRadius: 8,
      backgroundColor: c.tile,
      paddingVertical: 10,
      paddingHorizontal: 14,
    },
    hintLabel: { fontSize: 13, color: c.muted },
    hintTitle: { fontSize: 15, fontWeight: '800', color: c.text, marginTop: 2 },
    toast: {
      position: 'absolute',
      top: -6,
      alignSelf: 'center',
      backgroundColor: c.accent,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
    },
    toastText: { color: c.onSelected, fontWeight: '700', fontSize: 15 },
    mistakes: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 },
    mistakesLabel: { fontSize: 15, color: c.text, marginRight: 4 },
    dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: c.selected },
    dotUsed: { backgroundColor: c.border },
    controls: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 20 },
    control: { flex: 1, paddingHorizontal: 8 },
    hintButton: { marginTop: 12, borderStyle: 'dashed' },
  });
