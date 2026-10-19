// Oyunun saf mantığı: React'e bağımlı değil, böylece Node ile test edilebilir.

export type Level = 0 | 1 | 2 | 3;

export interface Group {
  title: string;
  words: [string, string, string, string];
  level: Level;
}

export interface Puzzle {
  id: number;
  groups: [Group, Group, Group, Group];
}

export type GuessResult =
  | { kind: 'correct'; group: Group }
  | { kind: 'oneAway' }
  | { kind: 'wrong' }
  | { kind: 'repeat' };

export const MAX_MISTAKES = 4;

// 1 numaralı günlük bulmacanın yayınlandığı gün (yerel saat).
export const START_DATE = new Date(2026, 9, 19);

const DAY_MS = 24 * 60 * 60 * 1000;

function localMidnightUTC(d: Date): number {
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Bugünün bulmaca numarası (1'den başlar). Başlangıçtan önceyse 1 döner. */
export function dayNumber(now: Date = new Date()): number {
  const diff = Math.floor((localMidnightUTC(now) - localMidnightUTC(START_DATE)) / DAY_MS);
  return Math.max(1, diff + 1);
}

export function dateForDay(day: number): Date {
  return new Date(START_DATE.getFullYear(), START_DATE.getMonth(), START_DATE.getDate() + day - 1);
}

export function puzzleForDay<T>(puzzles: readonly T[], day: number): T {
  return puzzles[(day - 1) % puzzles.length];
}

/** Tohumlu karıştırma: herkes aynı günde aynı dizilişi görsün diye. */
export function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const out = items.slice();
  let s = seed >>> 0 || 1;
  const rand = () => {
    // mulberry32
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function shuffle<T>(items: readonly T[]): T[] {
  return seededShuffle(items, Math.floor(Math.random() * 2 ** 31));
}

export function allWords(puzzle: Puzzle): string[] {
  return puzzle.groups.flatMap((g) => g.words);
}

function sameSet(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((w) => b.includes(w));
}

export function evaluateGuess(
  puzzle: Puzzle,
  selection: readonly string[],
  previousGuesses: readonly (readonly string[])[] = [],
): GuessResult {
  if (selection.length !== 4) throw new Error('Tahmin 4 kelime olmalı');
  if (previousGuesses.some((g) => sameSet(g, selection))) return { kind: 'repeat' };
  for (const group of puzzle.groups) {
    const hits = selection.filter((w) => group.words.includes(w)).length;
    if (hits === 4) return { kind: 'correct', group };
    if (hits === 3) return { kind: 'oneAway' };
  }
  return { kind: 'wrong' };
}

/** Bir tahmindeki her kelimenin ait olduğu grubun seviyesi. */
export function guessLevels(puzzle: Puzzle, guess: readonly string[]): Level[] {
  return guess.map((w) => puzzle.groups.find((g) => g.words.includes(w))!.level);
}

const EMOJI: Record<Level, string> = { 0: '🟨', 1: '🟩', 2: '🟦', 3: '🟪' };

export function shareText(
  puzzle: Puzzle,
  day: number,
  guesses: readonly (readonly string[])[],
  hintsUsed = 0,
): string {
  const rows = guesses.map((g) => guessLevels(puzzle, g).map((l) => EMOJI[l]).join(''));
  const header = ['Bağlantı', `Bulmaca #${day}`];
  if (hintsUsed > 0) header.push(`💡 ${hintsUsed} ipucu`);
  return [...header, ...rows].join('\n');
}

/**
 * Sıradaki ipucu: henüz çözülmemiş ve ipucu verilmemiş en kolay grup.
 * Verilecek ipucu kalmadıysa null.
 */
export function nextHint(puzzle: Puzzle, solved: readonly Level[], hinted: readonly Level[]): Group | null {
  const open = puzzle.groups
    .filter((g) => !solved.includes(g.level) && !hinted.includes(g.level))
    .sort((a, b) => a.level - b.level);
  return open[0] ?? null;
}

/** Bulmaca verisindeki yapısal hataları döner (boş dizi = geçerli). */
export function validatePuzzle(p: Puzzle): string[] {
  const errors: string[] = [];
  if (p.groups.length !== 4) errors.push(`#${p.id}: 4 grup olmalı`);
  const levels = p.groups.map((g) => g.level).sort();
  if (levels.join() !== '0,1,2,3') errors.push(`#${p.id}: seviyeler 0-3 birer kez olmalı`);
  const words = allWords(p);
  if (words.length !== 16) errors.push(`#${p.id}: 16 kelime olmalı`);
  const seen = new Set<string>();
  for (const w of words) {
    if (seen.has(w)) errors.push(`#${p.id}: tekrar eden kelime ${w}`);
    seen.add(w);
    if (w !== w.toLocaleUpperCase('tr-TR')) errors.push(`#${p.id}: büyük harf olmalı ${w}`);
    if (w.trim() !== w || w.length === 0) errors.push(`#${p.id}: boşluk hatası "${w}"`);
  }
  return errors;
}
