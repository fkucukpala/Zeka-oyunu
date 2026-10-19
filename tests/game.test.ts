/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  dayNumber,
  evaluateGuess,
  puzzleForDay,
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

test('puzzleForDay havuz bitince başa döner', () => {
  assert.equal(puzzleForDay(PUZZLES, 1), PUZZLES[0]);
  assert.equal(puzzleForDay(PUZZLES, PUZZLES.length + 1), PUZZLES[0]);
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
  assert.equal(text, 'Bağlantı\nBulmaca #7\n🟨🟨🟨🟨\n🟪🟪🟪🟪');
});
