import { memo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useTheme, useThemedStyles, type Colors } from '../theme';

interface Props {
  word: string;
  selected: boolean;
  size: number;
  disabled: boolean;
  onPress: (word: string) => void;
}

export const Tile = memo(function Tile({ word, selected, size, disabled, onPress }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      onPress={() => onPress(word)}
      disabled={disabled}
      style={({ pressed }) => [
        styles.tile,
        { width: size, height: size * 0.8 },
        { backgroundColor: selected ? colors.selected : pressed ? colors.tilePressed : colors.tile },
      ]}
    >
      <Text
        style={[styles.text, selected && styles.selectedText]}
        numberOfLines={word.includes(' ') ? 2 : 1}
        adjustsFontSizeToFit
        minimumFontScale={0.5}
      >
        {word}
      </Text>
    </Pressable>
  );
});

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    tile: {
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    text: {
      fontSize: 15,
      fontWeight: '700',
      color: c.text,
      textAlign: 'center',
    },
    selectedText: { color: c.onSelected },
  });
