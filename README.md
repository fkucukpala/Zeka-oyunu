# Bağlantı — Türkçe günlük kelime bulmacası

16 kelimeyi, ortak noktası olan 4'erli gruplara ayır. Her gün herkese aynı yeni bulmaca gelir; 4 hata hakkın var.
Android öncelikli olarak Expo (React Native + TypeScript) ile yazıldı.

## Özellikler

- Günlük bulmaca (gece yarısı yenilenir) ve geçmiş bulmacalar için **Arşiv**
- 4 zorluk rengi, "Bir eksik!" uyarısı, aynı tahmini tekrar etme koruması
- Karıştır / Temizle / Gönder, titreşimli geri bildirim, sallanma ve açılma animasyonları
- Emoji ızgaralı **sonuç paylaşma** (WhatsApp, X vb.)
- İstatistikler: oynanan, kazanma oranı, güncel ve en uzun seri, hata dağılımı
- İlerleme cihazda saklanır (AsyncStorage); oyuna kaldığın yerden devam edilir
- İnternet gerektirmez

## Android'de deneme

```bash
npm install
npx expo start
```

Telefona Play Store'dan **Expo Go** uygulamasını kur ve terminaldeki QR kodu okut.

## APK / Play Store derlemesi (EAS)

```bash
npx eas-cli@latest login
npx eas-cli@latest build -p android --profile preview      # telefona kurulabilir .apk
npx eas-cli@latest build -p android --profile production   # Play Store için .aab
```

Paket adı: `com.fkucukpala.baglanti` (`app.json` içinde değiştirilebilir). Her yeni mağaza sürümünde
`android.versionCode` değerini artır.

## Geliştirme

```bash
npm test            # oyun mantığı + bulmaca verisi doğrulaması
npm run typecheck
npm run lint
```

## Yeni bulmaca ekleme

`src/puzzles.ts` dosyasına yeni bir kayıt ekle:

- 4 grup, her grupta 4 kelime, seviyeler `0` (kolay) → `3` (en zor) birer kez
- Kelimeler Türkçe büyük harfle (`İ`, `I` dikkat), bulmaca içinde tekrar etmemeli
- İyi bulmacada bazı kelimeler başka bir gruba da uyuyormuş gibi görünür, ama çözüm tektir

`npm test` yapısal hataları yakalar. Bulmacalar `START_DATE`'ten (`src/game.ts`) itibaren her gün bir tane
gösterilir; havuz bitince başa döner, bu yüzden havuzu düzenli büyütmek gerekir.

## Proje yapısı

```
src/app/            Ekranlar (Expo Router): ana sayfa, oyun/[gun], arşiv, istatistik, nasıl oynanır
src/components/     Tile, SolvedGroup, ResultCard, Button
src/game.ts         Saf oyun mantığı (gün hesabı, tahmin değerlendirme, paylaşım metni)
src/puzzles.ts      Bulmaca havuzu
src/storage.ts      İlerleme ve istatistik kaydı
tests/              Node test runner ile birim testleri
```
