import type { Level } from './game';

export const colors = {
  background: '#FFFDF7',
  text: '#1F1E1A',
  muted: '#6B6A60',
  tile: '#EFEBE0',
  tilePressed: '#E2DDCE',
  selected: '#5A594E',
  onSelected: '#FFFFFF',
  border: '#D9D4C5',
  accent: '#1F1E1A',
};

export const levelColors: Record<Level, string> = {
  0: '#F9DF6D',
  1: '#A0C35A',
  2: '#B0C4EF',
  3: '#BA81C5',
};

export const levelNames: Record<Level, string> = {
  0: 'Kolay',
  1: 'Orta',
  2: 'Zor',
  3: 'Çok zor',
};
