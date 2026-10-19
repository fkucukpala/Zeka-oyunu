# Bağlantı — Kotlin / Android Studio sürümü

Expo sürümünün yerel (native) Android karşılığı: **Kotlin + Jetpack Compose**.
Oyun kuralları, bölüm/hak sistemi, ipuçları, reklamlar, satın almalar ve tasarım aynıdır.

## Android Studio'da açma

1. Android Studio'yu kur (güncel kararlı sürüm).
2. **File > Open** ile bu `android-kotlin` klasörünü seç (deponun kökünü değil).
3. Gradle eşitlemesi bitince üstteki ▶ (Run) düğmesiyle emülatörde veya USB'ye bağlı telefonda çalıştır.

Komut satırından:

```bash
cd android-kotlin
./gradlew :core:test        # oyun mantığı ve bulmaca verisi testleri
./gradlew assembleDebug     # app/build/outputs/apk/debug/app-debug.apk
```

Her push'ta GitHub Actions bu projeyi derler; **Actions > Android (Kotlin) > son çalıştırma >
Artifacts** bölümünden hazır `app-debug.apk` indirilebilir.

## Proje yapısı

```
core/   Saf Kotlin oyun mantığı (Android'e bağımlı değil) + JUnit testleri
        Game.kt: tahmin değerlendirme, ipucu, günlük hak, seri, paylaşım metni, veri doğrulama
app/    Android uygulaması
  data/GameStore.kt              İlerleme, istatistik, haklar, ipuçları, ayarlar (SharedPreferences)
  monetization/AdsManager.kt     AdMob geçiş + ödüllü reklam, GDPR izin formu (UMP)
  monetization/BillingManager.kt Google Play Billing: ipucu paketleri, "Reklamları kaldır"
  engagement/Engagement.kt       Günlük hatırlatma bildirimi (WorkManager), Play puanlama isteği
  ui/                            Compose ekranları: ana sayfa, oyun, bölümler, istatistik, mağaza…
  Config.kt                      Günlük hak, reklam sıklığı, ürün kimlikleri vb. tüm ayarlar
  assets/puzzles.json            Bulmaca havuzu
```

## Bulmacalar

Havuzun tek kaynağı deponun kökündeki `src/puzzles.ts` dosyasıdır. Değiştirdikten sonra:

```bash
node scripts/export-puzzles.mjs   # android-kotlin/app/src/main/assets/puzzles.json'u yeniler
```

GitHub Actions JSON dosyasının güncel olmadığını görürse derlemeyi durdurur.
Yalnızca Kotlin sürümüyle devam edeceksen `puzzles.json`'u doğrudan da düzenleyebilirsin;
`./gradlew :core:test` yapısal hataları ve tekrar eden grupları yakalar.

## Yayından önce

- `AndroidManifest.xml` içindeki AdMob **uygulama** kimliğini ve `Config.kt` içindeki **reklam birimi**
  kimliklerini kendi AdMob kimliklerinle değiştir (şu an Google'ın test kimlikleri).
- Play Console'da ürünleri oluştur: `ipucu_5`, `ipucu_15`, `ipucu_40` (tüketilebilir), `reklamsiz` (tek seferlik).
- İmzalı sürüm: Android Studio > **Build > Generate Signed App Bundle** (Play Store için `.aab`).
- Paket adı Expo sürümüyle aynıdır (`com.fkucukpala.baglanti`); Play'de ikisinden yalnızca biri yayınlanabilir.

## Hata ayıklama kolaylığı

Debug derlemesinde ödüllü reklam yüklenemezse (ör. Google Play hizmetleri olmayan emülatör)
"haklar bitti" ekranında **"Test: reklamsız +5 hak"** düğmesi çıkar. Release derlemesinde bu düğme yoktur.
