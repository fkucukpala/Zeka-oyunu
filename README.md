# Bağlantı — Türkçe günlük kelime bulmacası

16 kelimeyi, ortak noktası olan 4'erli gruplara ayır. Her gün herkese aynı yeni bulmaca gelir; 4 hata hakkın var.
Android öncelikli olarak Expo (React Native + TypeScript) ile yazıldı.

> **Kotlin / Android Studio sürümü:** [`android-kotlin/`](android-kotlin/README.md) klasöründe aynı oyunun
> Jetpack Compose ile yazılmış yerel Android karşılığı var. Bulmacalar iki sürümde ortaktır.

## Özellikler

- **Bölüm sistemi:** her gün 10 bölüm hakkı (gece yarısı yenilenir); bitince ödüllü reklamla +5 hak.
  Yarım kalan bölüme dönmek hak harcamaz. Oynanan bölümler **Bölümler** listesinde
- 4 zorluk rengi, "Bir eksik!" uyarısı, aynı tahmini tekrar etme koruması
- Karıştır / Temizle / Gönder, titreşimli geri bildirim, sallanma ve açılma animasyonları
- Emoji ızgaralı **sonuç paylaşma** (WhatsApp, X vb.)
- İstatistikler: oynanan, kazanma oranı, gün bazlı seri (arka arkaya en az bir bölüm kazanılan gün), hata dağılımı
- İlerleme cihazda saklanır (AsyncStorage); oyuna kaldığın yerden devam edilir
- Karanlık tema (sistemi takip eder, ana sayfadan Sistem / Açık / Koyu seçilebilir)
- **İpucu:** çözülmemiş en kolay grubun konusunu açar; yeni oyuncuya 3 hediye
- **Gelir:** bölüm sonu geçiş reklamı (ilk 2 bölümde yok, en az 90 sn arayla), ödüllü reklamla hak ve ipucu,
  Google Play'den ipucu paketleri ve tek seferlik "Reklamları kaldır"
- **Geri dönüş:** günlük hatırlatma bildirimi (ilk bulmaca sonunda teklif edilir), 3. galibiyetten sonra Play puanlama isteği

## Android'de deneme

```bash
npm install
npx expo start
```

Telefona Play Store'dan **Expo Go** uygulamasını kur ve terminaldeki QR kodu okut.

> Expo Go'da reklam ve satın alma **kapalıdır** (bu yerel modüller Expo Go'da yok); oyun, tema ve
> hediye ipuçları çalışır. Geliştirme modunda ödüllü reklam yerine "(test)" düğmesi anında ödül verir, böylece
> hak/ipucu akışı bilgisayarda da denenebilir. Gerçek reklam ve satın alma için geliştirme derlemesi gerekir:
> `npx eas-cli@latest build -p android --profile development`

## APK / Play Store derlemesi (EAS)

```bash
npx eas-cli@latest login
npx eas-cli@latest build -p android --profile preview      # telefona kurulabilir .apk
npx eas-cli@latest build -p android --profile production   # Play Store için .aab
```

Paket adı: `com.fkucukpala.baglanti` (`app.json` içinde değiştirilebilir). Her yeni mağaza sürümünde
`android.versionCode` değerini artır.

## Para kazanma kurulumu (yayından önce)

Kod şu an Google'ın **test** reklam kimlikleriyle gelir; gerçek gelir için:

1. **AdMob:** [admob.google.com](https://admob.google.com)'da uygulama ve bir "Geçiş (interstitial)" reklam birimi oluştur.
   - Uygulama kimliğini (`ca-app-pub-…~…`) `app.json` > `plugins` > `react-native-google-mobile-ads` > `androidAppId` alanına yaz.
   - Bir "Geçiş" ve bir "Ödüllü" reklam birimi oluştur; kimliklerini (`ca-app-pub-…/…`) `src/config.ts` > `AD_UNITS.android` alanına yaz.
   - AdMob > Gizlilik ve mesajlaşma bölümünden GDPR izin mesajını oluştur (uygulama, formu açılışta otomatik gösterir).
2. **Google Play ürünleri:** Play Console > Uygulama içi ürünler'de `ipucu_5`, `ipucu_15`, `ipucu_40`
   (**tüketilebilir**) ve `reklamsiz` (**tek seferlik**) ürünlerini oluştur ve fiyatlarını belirle
   (kimlikler `src/config.ts` içinde).
   Satın almalar yalnızca Play'e yüklenmiş (dahili test kanalı yeterli) bir sürümde çalışır.
3. **Play Console zorunlulukları:** gizlilik politikası bağlantısı, "Reklam içerir" beyanı ve Veri güvenliği formu
   (AdMob reklam kimliği topladığı için).

> Not: İpucu bakiyesi cihazda tutulur ve satın almalar sunucuda doğrulanmaz. Başlangıç için yeterli; gelir
> büyürse satın alma doğrulaması için bir sunucu eklemek önerilir.

Mağaza sayfası metni, ekran görüntüsü önerileri ve yayın kontrol listesi: [docs/play-store.md](docs/play-store.md)

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

`npm test` yapısal hataları ve farklı bulmacalarda tekrar eden grupları yakalar. Bölüm N, havuzdaki N. bulmacadır;
havuz bitince başa döner. Oyuncu günde 10+ bölüm oynayabildiği için havuzu düzenli büyütmek gerekir.
Günlük hak ve reklam başına hak sayısı `src/config.ts` içindeki `DAILY_ENERGY` / `ENERGY_PER_AD` ile değişir.

## Proje yapısı

```
src/app/            Ekranlar (Expo Router): ana sayfa, bolum/[no], bölümler, istatistik, nasıl oynanır, mağaza
src/components/     Tile, SolvedGroup, ResultCard, Button
src/game.ts         Saf oyun mantığı (gün hesabı, tahmin değerlendirme, paylaşım metni)
src/puzzles.ts      Bulmaca havuzu
src/storage.ts      İlerleme, istatistik ve ipucu bakiyesi kaydı
src/theme.tsx       Açık/koyu renk paletleri ve tema seçimi
src/ads.ts          AdMob geçiş ve ödüllü reklam (web'de ads.web.ts ile kapalı)
src/store.tsx       İpucu bakiyesi, Google Play satın almaları, reklamsız paket
src/engagement.ts   Günlük hatırlatma bildirimi ve Play puanlama isteği
src/config.ts       Reklam kimlikleri, reklam sıklığı, ürünler ve diğer gelir ayarları
tests/              Node test runner ile birim testleri
```
