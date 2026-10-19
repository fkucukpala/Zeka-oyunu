# Bağlantı — Türkçe kelime bulmacası (Android, Kotlin)

16 kelimeyi, ortak noktası olan 4'erli gruplara ayır. Oyun bölüm bölüm ilerler: her gün 10 bölüm hakkı,
bitince ödüllü reklam izleyerek 5 hak daha. **Kotlin + Jetpack Compose** ile yazılmış yerel Android uygulaması.

## Özellikler

- **Bölüm sistemi:** her gün 10 bölüm hakkı (gece yarısı yenilenir); bitince ödüllü reklamla +5 hak.
  Yarım kalan bölüme dönmek hak harcamaz. Oynanan bölümler **Bölümler** listesinde
- 4 zorluk rengi, "Bir eksik!" uyarısı, aynı tahmini tekrar etme koruması, 4 hata hakkı
- Karıştır / Temizle / Gönder, titreşimli geri bildirim, sallanma animasyonu
- Emoji ızgaralı **sonuç paylaşma** (WhatsApp, X vb.)
- İstatistikler: oynanan, kazanma oranı, gün bazlı seri, hata dağılımı
- Karanlık tema (sistemi takip eder; ana sayfadan Sistem / Açık / Koyu seçilebilir)
- **İpucu:** çözülmemiş en kolay grubun konusunu açar; yeni oyuncuya 3 hediye
- **Gelir:** bölüm sonu geçiş reklamı (ilk 2 bölümde yok, en az 90 sn arayla), ödüllü reklamla hak ve ipucu,
  Google Play'den ipucu paketleri ve tek seferlik "Reklamları kaldır"
- **Geri dönüş:** günlük hatırlatma bildirimi, 3. galibiyetten sonra Play puanlama isteği
- İnternet olmadan da oynanır; ilerleme cihazda saklanır ve Google yedeğiyle yeni telefona taşınır

## Android Studio'da açma

1. Android Studio'yu kur (güncel kararlı sürüm).
2. **File > Open** ile bu klasörü (deponun kökünü) seç.
3. Gradle eşitlemesi bitince ▶ (Run) ile emülatörde veya USB'ye bağlı telefonda çalıştır.

Komut satırından:

```bash
./gradlew :core:test        # oyun mantığı ve bulmaca verisi testleri
./gradlew assembleDebug     # app/build/outputs/apk/debug/app-debug.apk
```

Her push'ta GitHub Actions projeyi derleyip testleri çalıştırır; **Actions > Android (Kotlin) > son çalıştırma >
Artifacts** bölümünden hazır `app-debug.apk` indirilebilir.

Debug derlemesinde ödüllü reklam yüklenemezse (ör. Google Play hizmetleri olmayan emülatör) "haklar bitti"
ekranında **"Test: reklamsız +5 hak"** düğmesi çıkar; release derlemesinde bu düğme yoktur.

## Proje yapısı

```
core/   Saf Kotlin oyun mantığı (Android'e bağımlı değil) + JUnit testleri
        Game.kt: tahmin değerlendirme, ipucu, günlük hak, seri, paylaşım metni, veri doğrulama
app/    Android uygulaması
  Config.kt                      Günlük hak, reklam sıklığı, reklam ve ürün kimlikleri vb. tüm ayarlar
  data/GameStore.kt              İlerleme, istatistik, haklar, ipuçları, ayarlar (SharedPreferences)
  monetization/AdsManager.kt     AdMob geçiş + ödüllü reklam, GDPR izin formu (UMP)
  monetization/BillingManager.kt Google Play Billing: ipucu paketleri, "Reklamları kaldır"
  engagement/Engagement.kt       Günlük hatırlatma bildirimi (WorkManager), Play puanlama isteği
  ui/                            Compose ekranları: ana sayfa, oyun, bölümler, istatistik, mağaza…
  assets/puzzles.json            Bulmaca havuzu
docs/play-store.md               Mağaza sayfası metni ve yayın kontrol listesi
```

## Yeni bulmaca ekleme

Bulmacalar `app/src/main/assets/puzzles.json` dosyasındadır; her grup tek satırdır:

```json
{"id": 201, "groups": [
  {"level":0,"title":"Meyveler","words":["ELMA","ARMUT","ERİK","AYVA"]},
  ...
]}
```

- 4 grup, her grupta 4 kelime, seviyeler `0` (kolay) → `3` (en zor) birer kez
- Kelimeler Türkçe büyük harfle (`İ`, `I` dikkat), bulmaca içinde tekrar etmemeli
- İyi bulmacada bazı kelimeler başka bir gruba da uyuyormuş gibi görünür, ama çözüm tektir

`./gradlew :core:test` yapısal hataları ve farklı bulmacalarda tekrar eden grupları (3+ ortak kelime) yakalar.
Bölüm N, havuzdaki N. bulmacadır; havuz bitince başa döner. Oyuncu günde 10+ bölüm oynayabildiği için
havuzu düzenli büyütmek gerekir.

## Para kazanma kurulumu (yayından önce)

Kod şu an Google'ın **test** reklam kimlikleriyle gelir; gerçek gelir için:

1. **AdMob:** [admob.google.com](https://admob.google.com)'da uygulama, bir "Geçiş" ve bir "Ödüllü" reklam birimi oluştur.
   - Uygulama kimliğini (`ca-app-pub-…~…`) `app/src/main/AndroidManifest.xml` içindeki `APPLICATION_ID` alanına yaz.
   - Reklam birimi kimliklerini (`ca-app-pub-…/…`) `Config.kt` içindeki `INTERSTITIAL_AD_UNIT` ve `REWARDED_AD_UNIT` alanlarına yaz.
   - AdMob > Gizlilik ve mesajlaşma bölümünden GDPR izin mesajını oluştur (uygulama formu açılışta otomatik gösterir).
2. **Google Play ürünleri:** Play Console > Uygulama içi ürünler'de `ipucu_5`, `ipucu_15`, `ipucu_40`
   (**tüketilebilir**) ve `reklamsiz` (**tek seferlik**) ürünlerini oluştur ve fiyatlarını belirle.
   Satın almalar yalnızca Play'e yüklenmiş (dahili test kanalı yeterli) bir sürümde çalışır.
3. **Play Console zorunlulukları:** gizlilik politikası bağlantısı, "Reklam içerir" beyanı ve Veri güvenliği formu.
4. **İmzalı sürüm:** Android Studio > **Build > Generate Signed App Bundle** (Play Store için `.aab`).
   Her yeni mağaza sürümünde `app/build.gradle.kts` içindeki `versionCode` değerini artır.

> İpucu bakiyesi cihazda tutulur ve satın almalar sunucuda doğrulanmaz. Başlangıç için yeterli; gelir
> büyürse satın alma doğrulaması için bir sunucu eklemek önerilir.

Mağaza sayfası metni, ekran görüntüsü önerileri ve yayın kontrol listesi: [docs/play-store.md](docs/play-store.md)

> Projenin ilk sürümü Expo (React Native) ile yazılmıştı; o kod git geçmişinde duruyor.
