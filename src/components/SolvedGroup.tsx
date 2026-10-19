import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

import type { Group } from '../game';
import { levelColors, useThemedStyles, type Colors } from '../theme';

export function SolvedGroup({ group, height, animate }: { group: Group; height: number; animate: boolean }) {
  const styles = useThemedStyles(makeStyles);
  const [scale] = useState(() => new Animated.Value(animate ? 0.85 : 1));

  useEffect(() => {
    if (!animate) return;
    Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }).start();
  }, [animate, scale]);

  return (
    <Animated.View
      style={[styles.box, { height, backgroundColor: levelColors[group.level], transform: [{ scale }] }]}
      accessible
      accessibilityLabel={`${group.title}: ${group.words.join(', ')}`}
    >
      <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
        {group.title.toLocaleUpperCase('tr-TR')}
      </Text>
      <Text style={styles.words} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.6}>
        {group.words.join(', ')}
      </Text>
    </Animated.View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    box: {
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 10,
    },
    title: { fontSize: 15, fontWeight: '800', color: c.onLevel },
    words: { fontSize: 14, color: c.onLevel, textAlign: 'center', marginTop: 2 },
  });
