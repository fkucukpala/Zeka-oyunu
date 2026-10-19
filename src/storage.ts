import AsyncStorage from '@react-native-async-storage/async-storage';

import { MAX_MISTAKES, type Level } from './game';

export type Status = 'playing' | 'won' | 'lost';

export interface Progress {
  guesses: string[][];
  solved: Level[];
  mistakes: number;
  status: Status;
  /** İpucu olarak adı açılan grupların seviyeleri. */
  hints: Level[];
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
const HINTS_KEY = 'baglanti:hints';
const GRANTED_KEY = 'baglanti:granted-purchases';

/** Yeni oyuncuya hediye edilen ipucu sayısı. */
export const WELCOME_HINTS = 3;

export const EMPTY_PROGRESS: Progress = { guesses: [], solved: [], mistakes: 0, status: 'playing', hints: [] };

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

export async function loadHintBalance(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(HINTS_KEY);
    return raw === null ? WELCOME_HINTS : Math.max(0, Number(raw) || 0);
  } catch {
    return WELCOME_HINTS;
  }
}

async function saveHintBalance(n: number): Promise<void> {
  await AsyncStorage.setItem(HINTS_KEY, String(n));
}

/** Bir ipucu harcar; bakiye yetersizse false döner. */
export async function spendHint(): Promise<{ ok: boolean; balance: number }> {
  const balance = await loadHintBalance();
  if (balance <= 0) return { ok: false, balance };
  await saveHintBalance(balance - 1);
  return { ok: true, balance: balance - 1 };
}

/**
 * Satın alınan ipuçlarını bakiyeye ekler. Aynı satın alma (token) ikinci kez
 * gelirse — örneğin işlem tamamlanmadan uygulama kapanıp yeniden açılırsa —
 * tekrar eklenmez.
 */
export async function grantPurchase(purchaseKey: string, hints: number): Promise<number> {
  const raw = await AsyncStorage.getItem(GRANTED_KEY);
  const granted: string[] = raw ? JSON.parse(raw) : [];
  const balance = await loadHintBalance();
  if (granted.includes(purchaseKey)) return balance;
  const next = balance + hints;
  await saveHintBalance(next);
  await AsyncStorage.setItem(GRANTED_KEY, JSON.stringify([...granted, purchaseKey].slice(-200)));
  return next;
}

/** Ödüllü reklam gibi ücretsiz kaynaklardan ipucu ekler. */
export async function addHints(n: number): Promise<number> {
  const next = (await loadHintBalance()) + n;
  await saveHintBalance(next);
  return next;
}

// Basit evet/hayır bayrakları (reklamsız satın alındı mı, hatırlatma soruldu mu vb.).
export type Flag = 'ads-removed' | 'reminder-asked' | 'reminder-on' | 'review-asked';

export async function getFlag(flag: Flag): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(`baglanti:${flag}`)) === '1';
  } catch {
    return false;
  }
}

export async function setFlag(flag: Flag, value: boolean): Promise<void> {
  await AsyncStorage.setItem(`baglanti:${flag}`, value ? '1' : '0');
}

/** Bitirilen (kazanılan ya da kaybedilen) toplam bulmaca sayısını bir artırır, yeni değeri döner. */
export async function bumpFinishedCount(): Promise<number> {
  const key = 'baglanti:finished-count';
  const next = (Number(await AsyncStorage.getItem(key)) || 0) + 1;
  await AsyncStorage.setItem(key, String(next));
  return next;
}
