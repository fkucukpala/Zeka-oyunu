import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import type { Level } from './game';

export type Colors = typeof lightColors;
export type ThemePreference = 'system' | 'light' | 'dark';

const lightColors = {
  background: '#FFFDF7',
  text: '#1F1E1A',
  muted: '#6B6A60',
  tile: '#EFEBE0',
  tilePressed: '#E2DDCE',
  selected: '#5A594E',
  onSelected: '#FFFFFF',
  border: '#D9D4C5',
  accent: '#1F1E1A',
  /** Renkli grup şeritleri her iki temada da açık renkli; üstlerindeki yazı hep koyu. */
  onLevel: '#1F1E1A',
};

const darkColors: Colors = {
  background: '#121211',
  text: '#F2F0E8',
  muted: '#A3A197',
  tile: '#2B2A27',
  tilePressed: '#3A3935',
  selected: '#E8E4D6',
  onSelected: '#121211',
  border: '#3A3935',
  accent: '#F2F0E8',
  onLevel: '#1F1E1A',
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

interface Theme {
  colors: Colors;
  scheme: 'light' | 'dark';
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
}

const PREF_KEY = 'baglanti:theme';

const ThemeContext = createContext<Theme>({
  colors: lightColors,
  scheme: 'light',
  preference: 'system',
  setPreference: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [preference, setPref] = useState<ThemePreference>('system');

  useEffect(() => {
    AsyncStorage.getItem(PREF_KEY)
      .then((v) => {
        if (v === 'light' || v === 'dark' || v === 'system') setPref(v);
      })
      .catch(() => {});
  }, []);

  const value = useMemo<Theme>(() => {
    const scheme = preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;
    return {
      colors: scheme === 'dark' ? darkColors : lightColors,
      scheme,
      preference,
      setPreference: (p) => {
        setPref(p);
        AsyncStorage.setItem(PREF_KEY, p).catch(() => {});
      },
    };
  }, [preference, system]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

/** Bileşen stillerini aktif temaya göre bir kez üretir. */
export function useThemedStyles<T>(factory: (c: Colors) => T): T {
  const { colors } = useTheme();
  // factory her bileşende modül düzeyinde sabit tanımlandığı için bağımlılık yalnızca renkler.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => factory(colors), [colors]);
}
