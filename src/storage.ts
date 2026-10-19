import AsyncStorage from '@react-native-async-storage/async-storage';

import { DAILY_ENERGY } from './config';
import { applyFinish, dayNumber, energyForToday, MAX_MISTAKES, type Energy, type Level, type Stats } from './game';

export type { Stats };

export type Status = 'playing' | 'won' | 'lost';

export interface Progress {
  guesses: string[][];
  solved: Level[];
  mistakes: number;
  status: Status;
  /** İpucu olarak adı açılan grupların seviyeleri. */
  hints: Level[];
}


const progressKey = (level: number) => `baglanti:level-progress:${level}`;
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

/** Bölümün kayıtlı ilerlemesi; hiç başlanmadıysa null. */
export async function loadProgress(level: number): Promise<Progress | null> {
  try {
    const raw = await AsyncStorage.getItem(progressKey(level));
    return raw ? { ...EMPTY_PROGRESS, ...JSON.parse(raw) } : null;
  } catch {
    return null;
  }
}

export async function saveProgress(level: number, progress: Progress): Promise<void> {
  await AsyncStorage.setItem(progressKey(level), JSON.stringify(progress));
}

export async function loadAllStatuses(levels: number[]): Promise<Record<number, Status>> {
  const pairs = await AsyncStorage.multiGet(levels.map(progressKey));
  const out: Record<number, Status> = {};
  pairs.forEach(([, raw], i) => {
    if (!raw) return;
    try {
      out[levels[i]] = (JSON.parse(raw) as Progress).status;
    } catch {
      // bozuk kayıt: oynanmamış say
    }
  });
  return out;
}

export function loadStats(): Promise<Stats> {
  return readJSON(STATS_KEY, EMPTY_STATS);
}

/** Seri, en son bölüm kazanılan gün dün ya da bugün değilse kopmuştur. */
export function visibleStreak(stats: Stats, today: number): number {
  return stats.lastWonDay >= today - 1 ? stats.currentStreak : 0;
}

/** Bir bölüm bittiğinde istatistikleri günceller (seri kuralları için bkz. applyFinish). */
export async function recordFinish(won: boolean, mistakes: number): Promise<Stats> {
  const next = applyFinish(await loadStats(), dayNumber(), won, mistakes);
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

// --- Bölümler ve günlük haklar ---

const LEVEL_KEY = 'baglanti:current-level';
const ENERGY_KEY = 'baglanti:energy';

/** Oyuncunun sıradaki (henüz bitirmediği) bölümü. */
export async function loadCurrentLevel(): Promise<number> {
  try {
    return Math.max(1, Number(await AsyncStorage.getItem(LEVEL_KEY)) || 1);
  } catch {
    return 1;
  }
}

/** Bir bölüm bitince sıradaki bölümü ilerletir (geriye gitmez). */
export async function advanceLevel(finished: number): Promise<void> {
  const current = await loadCurrentLevel();
  if (finished >= current) await AsyncStorage.setItem(LEVEL_KEY, String(finished + 1));
}

export async function loadEnergy(): Promise<Energy> {
  let saved: Energy | null = null;
  try {
    const raw = await AsyncStorage.getItem(ENERGY_KEY);
    saved = raw ? JSON.parse(raw) : null;
  } catch {
    saved = null;
  }
  return energyForToday(saved, dayNumber(), DAILY_ENERGY);
}

async function saveEnergy(e: Energy): Promise<void> {
  await AsyncStorage.setItem(ENERGY_KEY, JSON.stringify(e));
}

export async function addEnergy(n: number): Promise<Energy> {
  const e = await loadEnergy();
  const next = { ...e, left: e.left + n };
  await saveEnergy(next);
  return next;
}

const starting = new Map<number, Promise<Progress | null>>();

/**
 * Bölümü açar. Daha önce başlanmışsa kayıtlı ilerlemeyi döner (hak harcamaz);
 * yeni başlıyorsa 1 hak harcar. Hak yoksa null döner. Aynı bölüm için aynı anda gelen
 * çağrılar tek hak harcar (ör. ekranın iki kez açılması).
 */
export function openLevel(level: number): Promise<Progress | null> {
  const inFlight = starting.get(level);
  if (inFlight) return inFlight;
  const task = (async () => {
    const existing = await loadProgress(level);
    if (existing) return existing;
    const energy = await loadEnergy();
    if (energy.left <= 0) return null;
    await saveEnergy({ ...energy, left: energy.left - 1 });
    await saveProgress(level, EMPTY_PROGRESS);
    return EMPTY_PROGRESS;
  })();
  starting.set(level, task);
  task.finally(() => starting.delete(level));
  return task;
}
