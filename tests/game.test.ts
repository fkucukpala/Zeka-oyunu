/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  dayNumber,
  evaluateGuess,
  nextHint,
  applyFinish,
  energyForToday,
  type Stats,
  puzzleForLevel,
  seededShuffle,
  shareText,
  START_DATE,
  validatePuzzle,
} from '../src/game.ts';
import { PUZZLES } from '../src/puzzles.ts';

test('tüm bulmacalar yapısal olarak geçerli', () => {
  const errors = PUZZLES.flatMap(validatePuzzle);
  assert.deepEqual(errors, []);
  const ids = PUZZLES.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length, 'id tekrarı var');
});

test('dayNumber başlangıç gününde 1, ertesi gün 2', () => {
  const start = new Date(START_DATE);
  assert.equal(dayNumber(start), 1);
  start.setHours(23, 59);
  assert.equal(dayNumber(start), 1);
  const next = new Date(START_DATE.getFullYear(), START_DATE.getMonth(), START_DATE.getDate() + 1, 0, 1);
  assert.equal(dayNumber(next), 2);
  assert.equal(dayNumber(new Date(2000, 0, 1)), 1);
});

test('puzzleForLevel havuz bitince başa döner', () => {
  assert.equal(puzzleForLevel(PUZZLES, 1), PUZZLES[0]);
  assert.equal(puzzleForLevel(PUZZLES, PUZZLES.length + 1), PUZZLES[0]);
});

test('evaluateGuess doğru, bir eksik, yanlış ve tekrar', () => {
  const p = PUZZLES[0];
  const [a, b] = p.groups;
  const correct = evaluateGuess(p, a.words);
  assert.equal(correct.kind, 'correct');
  const oneAway = [a.words[0], a.words[1], a.words[2], b.words[0]];
  assert.equal(evaluateGuess(p, oneAway).kind, 'oneAway');
  const wrong = [a.words[0], a.words[1], b.words[0], b.words[1]];
  assert.equal(evaluateGuess(p, wrong).kind, 'wrong');
  assert.equal(evaluateGuess(p, [...wrong].reverse(), [wrong]).kind, 'repeat');
});

test('seededShuffle aynı tohumla aynı sırayı verir ve elemanları korur', () => {
  const items = Array.from({ length: 16 }, (_, i) => i);
  const x = seededShuffle(items, 42);
  assert.deepEqual(x, seededShuffle(items, 42));
  assert.deepEqual([...x].sort((m, n) => m - n), items);
});

test('shareText seviye emojilerini üretir', () => {
  const p = PUZZLES[0];
  const text = shareText(p, 7, [p.groups[0].words, p.groups[3].words]);
  assert.equal(text, 'Bağlantı\nBölüm 7\n🟨🟨🟨🟨\n🟪🟪🟪🟪');
});

test('nextHint en kolay çözülmemiş ve ipucu verilmemiş grubu döner', () => {
  const p = PUZZLES[0];
  assert.equal(nextHint(p, [], [])?.level, 0);
  assert.equal(nextHint(p, [0], [])?.level, 1);
  assert.equal(nextHint(p, [0], [1])?.level, 2);
  assert.equal(nextHint(p, [0, 1, 2], [3]), null);
});

test('shareText kullanılan ipucu sayısını yazar', () => {
  const p = PUZZLES[0];
  assert.equal(shareText(p, 3, [p.groups[1].words], 2), 'Bağlantı\nBölüm 3\n💡 2 ipucu\n🟩🟩🟩🟩');
});

test('farklı bulmacalarda neredeyse aynı grup yok (en fazla 2 ortak kelime)', () => {
  const groups = PUZZLES.flatMap((p) => p.groups.map((g) => ({ id: p.id, title: g.title, words: g.words })));
  const clashes: string[] = [];
  for (let i = 0; i < groups.length; i++) {
    for (let j = i + 1; j < groups.length; j++) {
      const a = groups[i];
      const b = groups[j];
      if (a.id === b.id) continue;
      const common = a.words.filter((w) => b.words.includes(w));
      if (common.length >= 3) clashes.push(`#${a.id} "${a.title}" ~ #${b.id} "${b.title}": ${common.join(', ')}`);
    }
  }
  assert.deepEqual(clashes, []);
});

test('energyForToday yeni günde hakları yeniler, aynı günde korur', () => {
  assert.deepEqual(energyForToday(null, 5, 10), { day: 5, left: 10 });
  assert.deepEqual(energyForToday({ day: 5, left: 3 }, 5, 10), { day: 5, left: 3 });
  assert.deepEqual(energyForToday({ day: 4, left: 0 }, 5, 10), { day: 5, left: 10 });
  // Reklamla 10'un üstüne çıkılmış hak aynı gün içinde korunur.
  assert.deepEqual(energyForToday({ day: 5, left: 14 }, 5, 10), { day: 5, left: 14 });
});

test('applyFinish seriyi gün bazlı sayar', () => {
  const empty: Stats = { played: 0, won: 0, currentStreak: 0, maxStreak: 0, lastWonDay: 0, distribution: [0, 0, 0, 0] };
  let s = applyFinish(empty, 10, true, 1);
  assert.equal(s.currentStreak, 1);
  s = applyFinish(s, 10, true, 0); // aynı gün ikinci galibiyet
  assert.equal(s.currentStreak, 1);
  assert.equal(s.won, 2);
  s = applyFinish(s, 10, false, 4); // kaybetmek seriyi bozmaz
  assert.equal(s.currentStreak, 1);
  assert.equal(s.played, 3);
  s = applyFinish(s, 11, true, 2); // ertesi gün
  assert.equal(s.currentStreak, 2);
  s = applyFinish(s, 13, true, 0); // bir gün boşluk
  assert.equal(s.currentStreak, 1);
  assert.equal(s.maxStreak, 2);
  assert.deepEqual(s.distribution, [2, 1, 1, 0]);
});
