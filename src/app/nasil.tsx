import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { Level } from '../game';
import { levelColors, levelNames, useThemedStyles, type Colors } from '../theme';

const EXAMPLES: { level: Level; title: string; words: string }[] = [
  { level: 0, title: 'Meyveler', words: 'ELMA, ARMUT, ERİK, AYVA' },
  { level: 3, title: '___ saati', words: 'KUM, DUVAR, KOL, CEP' },
];

export default function HowToScreen() {
  const styles = useThemedStyles(makeStyles);
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.p}>16 kelimenin içinden ortak bir noktası olan 4 kelimelik grupları bul.</Text>
      <Text style={styles.li}>• 4 kelime seç ve “Gönder”e dokun.</Text>
      <Text style={styles.li}>• Grubu doğru bulursan kelimeler renkli bir şerit olur.</Text>
      <Text style={styles.li}>• 4 hata hakkın var. 3 kelimen doğruysa “Bir eksik!” uyarısı çıkar.</Text>
      <Text style={styles.li}>• Dikkat: bazı kelimeler birden fazla gruba uyuyor gibi görünür, ama tek doğru çözüm vardır.</Text>
      <Text style={styles.li}>• Takıldığında “İpucu al” ile bir grubun konusunu öğrenebilirsin.</Text>
      <Text style={styles.li}>• Her gece yarısı yeni bulmaca gelir. Kaçırdıklarını Arşiv’den oynayabilirsin.</Text>

      <Text style={styles.heading}>Örnekler</Text>
      {EXAMPLES.map((e) => (
        <View key={e.title} style={[styles.example, { backgroundColor: levelColors[e.level] }]}>
          <Text style={styles.exampleTitle}>{e.title.toLocaleUpperCase('tr-TR')}</Text>
          <Text style={styles.exampleWords}>{e.words}</Text>
        </View>
      ))}

      <Text style={styles.heading}>Renkler zorluğu gösterir</Text>
      <View style={styles.legend}>
        {([0, 1, 2, 3] as Level[]).map((l) => (
          <View key={l} style={styles.legendItem}>
            <View style={[styles.swatch, { backgroundColor: levelColors[l] }]} />
            <Text style={styles.legendText}>{levelNames[l]}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    content: { padding: 20 },
    p: { fontSize: 17, fontWeight: '600', color: c.text, marginBottom: 12 },
    li: { fontSize: 16, color: c.text, marginBottom: 8, lineHeight: 22 },
    heading: { fontSize: 17, fontWeight: '800', color: c.text, marginTop: 20, marginBottom: 10 },
    example: { borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 8 },
    exampleTitle: { fontSize: 15, fontWeight: '800', color: c.onLevel },
    exampleWords: { fontSize: 14, color: c.onLevel, marginTop: 2 },
    legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    swatch: { width: 20, height: 20, borderRadius: 4 },
    legendText: { fontSize: 15, color: c.text },
  });
