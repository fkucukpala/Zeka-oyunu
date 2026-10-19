import AsyncStorage from '@react-native-async-storage/async-storage';

import { MAX_MISTAKES, type Level } from './game';

export type Status = 'playing' | 'won' | 'lost';

export interface Progress {
  guesses: string[][];
  solved: Level[];
  mistakes: number;
  status: Status;
}

export interface Stats {
  played: number;
  won: number;
  currentStreak: number;
  maxStreak: number;
  /** Seri hesabı için son kazanılan günlük bulmacanın numarası. */
  lastWonDay: number;
  /** Kazanılan oyunlarda yapılan hata sayısına göre dağılım (0..3). */
  distribution: number[];
}

const progressKey = (day: number) => `baglanti:progress:${day}`;
const STATS_KEY = 'baglanti:stats';

export const EMPTY_PROGRESS: Progress = { guesses: [], solved: [], mistakes: 0, status: 'playing' };

export const EMPTY_STATS: Stats = {
  played: 0,
  won: 0,
  currentStreak: 0,
  maxStreak: 0,
  lastWonDay: 0,
  distribution: Array(MAX_MISTAKES).fill(0),
};

async function readJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

export function loadProgress(day: number): Promise<Progress> {
  return readJSON(progressKey(day), EMPTY_PROGRESS);
}

export async function saveProgress(day: number, progress: Progress): Promise<void> {
  await AsyncStorage.setItem(progressKey(day), JSON.stringify(progress));
}

export async function loadAllStatuses(days: number[]): Promise<Record<number, Status>> {
  const pairs = await AsyncStorage.multiGet(days.map(progressKey));
  const out: Record<number, Status> = {};
  pairs.forEach(([, raw], i) => {
    if (!raw) return;
    try {
      out[days[i]] = (JSON.parse(raw) as Progress).status;
    } catch {
      // bozuk kayıt: oynanmamış say
    }
  });
  return out;
}

export function loadStats(): Promise<Stats> {
  return readJSON(STATS_KEY, EMPTY_STATS);
}

/** Seri, en son kazanılan gün dün ya da bugün değilse kopmuştur. */
export function visibleStreak(stats: Stats, today: number): number {
  return stats.lastWonDay >= today - 1 ? stats.currentStreak : 0;
}

/**
 * Bir bulmaca bittiğinde istatistikleri günceller. Arşivden oynanan eski
 * bulmacalar seriyi etkilemez; yalnızca kendi gününde oynanan bulmaca sayılır.
 */
export async function recordFinish(day: number, today: number, won: boolean, mistakes: number): Promise<Stats> {
  if (day !== today) return loadStats();
  const s = await loadStats();
  const next: Stats = { ...s, distribution: [...s.distribution], played: s.played + 1 };
  if (won) {
    next.won += 1;
    next.currentStreak = s.lastWonDay === day - 1 ? s.currentStreak + 1 : 1;
    next.maxStreak = Math.max(s.maxStreak, next.currentStreak);
    next.lastWonDay = day;
    next.distribution[Math.min(mistakes, MAX_MISTAKES - 1)] += 1;
  } else {
    next.currentStreak = 0;
  }
  await AsyncStorage.setItem(STATS_KEY, JSON.stringify(next));
  return next;
}
