# Capacitor Build Guide — Who Am I?

> Step-by-step οδηγίες για τη δημιουργία signed Android App Bundle (.aab) όταν έχεις πρόσβαση σε PC/Mac.

## Προαπαιτούμενα

- PC ή Mac με Windows/macOS/Linux
- Node.js + bun (ή npm)
- Android Studio (τελευταία stable έκδοση)
- JDK 17+ (συνήθως έρχεται με Android Studio)
- Git (για clone του repo)

## Βήμα 1: Προσθήκη Capacitor dependencies

Στο root του project τρέξε:

```bash
bun add @capacitor/core @capacitor/cli @capacitor/android
```

## Βήμα 2: Αρχικοποίηση Capacitor

```bash
npx cap init "Who Am I?" com.geoloapps.whoami --web-dir dist-pages
```

> Χρησιμοποιούμε `dist-pages` γιατί εκεί είναι το static build που φτιάχνουμε για GitHub Pages.

## Βήμα 3: Build του web app

```bash
GITHUB_PAGES_BASE=/Who-Am-I/ bun run build:pages
```

## Βήμα 4: Προσθήκη Android platform

```bash
npx cap add android
```

## Βήμα 5: Συγχρονισμός web assets

Κάθε φορά που αλλάζεις το web app:

```bash
bun run build:pages
npx cap sync android
```

## Βήμα 6: Άνοιγμα Android Studio

```bash
npx cap open android
```

## Βήμα 7: App signing

### Επιλογή Α — Google-managed signing (συνιστάται)

1. Play Console → Release → Setup → App integrity → App signing.
2. Επίλεξε **Create new release** και άσε τη Google να δημιουργήσει managed key.
3. Το upload key μπορείς να το δημιουργήσεις τοπικά στο επόμενο βήμα.

### Επιλογή Β — Δικό σου keystore

Δημιούργησε `.jks`:

```bash
keytool -genkey -v -keystore whoami-upload.keystore -alias whoami -keyalg RSA -keysize 2048 -validity 10000
```

Κράτησέ το ασφαλές — αν χαθεί, δεν μπορείς να ξανακάνεις update.

## Βήμα 8: Generate Signed Bundle

1. Android Studio → Build → Generate Signed Bundle / APK...
2. Επίλεξε **Android App Bundle (.aab)**.
3. Επίλεξε το keystore από το Βήμα 7.
4. Build.

Το αρχείο θα βγει σε:

```
android/app/release/app-release.aab
```

## Βήμα 9: Upload στο Play Console

1. Play Console → Release → Production → Create new release.
2. Upload το `.aab`.
3. Συμπλήρωσε release notes (π.χ. "Initial release").
4. Submit.

## Βήμα 10: Ενημέρωση store assets

Πριν το submit, βεβαιώσου ότι έχεις ανεβάσει:

- App icon (512×512): `src/assets/icon-512.png`
- Feature graphic (1024×500): `src/assets/feature-graphic.png`
- Phone screenshots: `docs/screenshots/*.png`
- Tablet screenshots: `docs/screenshots/tablet/*.png`
- Short & full description: `docs/store-assets/play-store-metadata.md`
- Privacy policy URL: `https://georgetsolas.github.io/Who-Am-I/privacy`

## Χρήσιμες εντολές

```bash
# Build + sync σε ένα βήμα
bun run build:pages && npx cap sync android

# Live reload σε συσκευή (αν θέλεις να δοκιμάσεις)
npx cap run android
```

## Σημειώσεις

- Το package name `com.geoloapps.whoami` δεν αλλάζει μετά την πρώτη δημοσίευση.
- Το tilt mode χρησιμοποιεί Device Orientation API μέσα στο WebView — δεν χρειάζεται extra Android permission.
- Το app δεν χρειάζεται internet permission, αλλά το Capacitor το προσθέτει by default. Μπορείς να το αφαιρέσεις από `AndroidManifest.xml` αν θες αυστηρό offline-only.
