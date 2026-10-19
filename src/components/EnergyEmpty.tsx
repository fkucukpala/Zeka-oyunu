import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DAILY_ENERGY, ENERGY_PER_AD } from '../config';
import { useMidnightCountdown } from '../countdown';
import { useStore } from '../store';
import { useThemedStyles, type Colors } from '../theme';
import { Button } from './Button';

/** Günlük haklar bitince gösterilir: reklam izleyip hak kazanma ya da yarını bekleme. */
export function EnergyEmpty({ onEarned }: { onEarned: () => void }) {
  const styles = useThemedStyles(makeStyles);
  const { rewardedReady, watchAdForEnergy, adsSimulated } = useStore();
  const countdown = useMidnightCountdown();
  const [watching, setWatching] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const watch = async () => {
    setWatching(true);
    setMsg(null);
    const earned = await watchAdForEnergy();
    setWatching(false);
    if (earned) onEarned();
    else setMsg('Hak kazanmak için reklamın sonuna kadar izlenmesi gerekiyor.');
  };

  return (
    <View style={styles.box}>
      <Text style={styles.emoji}>⚡</Text>
      <Text style={styles.title}>Bugünkü hakların bitti</Text>
      <Text style={styles.body}>
        Her gün {DAILY_ENERGY} yeni bölüm hakkın olur. Beklemek istemiyorsan kısa bir reklam izleyip hemen{' '}
        {ENERGY_PER_AD} hak kazanabilirsin.
      </Text>
      <Button
        label={
          watching
            ? 'Reklam açılıyor…'
            : rewardedReady
              ? `🎬 Reklam izle, +${ENERGY_PER_AD} hak${adsSimulated ? ' (test)' : ''}`
              : 'Reklam hazırlanıyor…'
        }
        variant="primary"
        onPress={watch}
        disabled={watching || !rewardedReady}
        style={styles.button}
      />
      {msg && <Text style={styles.msg}>{msg}</Text>}
      <Text style={styles.countdown}>
        Yeni haklar: <Text style={styles.bold}>{countdown}</Text> sonra
      </Text>
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    box: { alignItems: 'center', backgroundColor: c.tile, borderRadius: 14, padding: 24, marginTop: 24 },
    emoji: { fontSize: 44 },
    title: { fontSize: 22, fontWeight: '800', color: c.text, marginTop: 8 },
    body: { fontSize: 15, color: c.text, textAlign: 'center', marginTop: 10, lineHeight: 21 },
    button: { alignSelf: 'stretch', marginTop: 20 },
    msg: { fontSize: 14, color: c.muted, textAlign: 'center', marginTop: 10 },
    countdown: { fontSize: 15, color: c.muted, marginTop: 16 },
    bold: { fontWeight: '700', color: c.text },
  });
