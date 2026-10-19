import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { REMINDER_HOUR } from '../config';
import { enableReminder, shouldOfferReminder } from '../engagement';
import { setFlag } from '../storage';
import { useThemedStyles, type Colors } from '../theme';
import { Button } from './Button';

/**
 * Bulmaca sonunda bir kez, günlük hatırlatma teklif eder. Sistem izin penceresinden
 * önce kendi sorumuzu sormak, izin verilme oranını belirgin şekilde artırır.
 */
export function ReminderOffer() {
  const styles = useThemedStyles(makeStyles);
  const [state, setState] = useState<'hidden' | 'ask' | 'on' | 'denied'>('hidden');

  useEffect(() => {
    shouldOfferReminder().then((offer) => offer && setState('ask'));
  }, []);

  if (state === 'hidden') return null;

  if (state !== 'ask') {
    return (
      <Text style={styles.done}>
        {state === 'on'
          ? `🔔 Tamam! Her gün ${REMINDER_HOUR}:00'da haber vereceğim.`
          : 'Bildirim izni verilmedi. İstersen telefon ayarlarından açabilirsin.'}
      </Text>
    );
  }

  return (
    <View style={styles.box}>
      <Text style={styles.title}>🔔 Yeni bulmacayı kaçırma</Text>
      <Text style={styles.body}>Her gün {REMINDER_HOUR}:00’da yeni bulmaca hazır olduğunda haber vereyim mi?</Text>
      <View style={styles.row}>
        <Button
          label="Hayır"
          onPress={() => {
            setFlag('reminder-asked', true);
            setState('hidden');
          }}
          style={styles.btn}
        />
        <Button
          label="Evet, hatırlat"
          variant="primary"
          onPress={async () => setState((await enableReminder()) ? 'on' : 'denied')}
          style={styles.btn}
        />
      </View>
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    box: { alignSelf: 'stretch', backgroundColor: c.tile, borderRadius: 12, padding: 16, marginBottom: 16 },
    title: { fontSize: 16, fontWeight: '800', color: c.text },
    body: { fontSize: 15, color: c.text, marginTop: 6, lineHeight: 21 },
    row: { flexDirection: 'row', gap: 10, marginTop: 14 },
    btn: { flex: 1, paddingHorizontal: 8 },
    done: { fontSize: 14, color: c.muted, textAlign: 'center', marginBottom: 16 },
  });
