## Στόχος

Να ολοκληρωθούν όλα τα πεδία του Google Play Console που δεν απαιτούν `.aab`, ώστε σε 2 μέρες με το PC να μείνει μόνο το upload του signed bundle και το submit.

## Τι μπορείς να κάνεις ΤΩΡΑ στο Play Console

Χωρίς `.aab` μπορείς να συμπληρώσεις όλο το store listing και τις ρυθμίσεις:

1. **Store listing**
   - App name: `Who Am I? — Heads Up Party Game`
   - Short description: `Heads Up party game: guess celebrities, characters & myths with friends.`
   - Full description: αντιγραφή από `docs/store-assets/play-store-metadata.md`
   - App icon (512×512): `docs/store-assets/android-launcher-icons/playstore/ic_launcher-playstore.png`
   - Feature graphic (1024×500): `src/assets/feature-graphic.png`
   - Phone screenshots: `docs/screenshots/*.png`
   - 7-inch tablet screenshots: `docs/screenshots/tablet-7inch/*.png`
   - 10-inch tablet screenshots: `docs/screenshots/tablet-10inch/*.png`
   - Category: Games → Casual / Party
   - Tags: heads up, party game, guessing game, charades, family game, offline games

2. **Privacy & compliance**
   - Privacy policy URL: `https://georgetsolas.github.io/Who-Am-I/privacy`
   - Data safety: απαντήσεις από `docs/store-assets/data-safety.md` (No data collected/shared, no encryption, no deletion mechanism)
   - Content rating: συμπλήρωση questionnaire, αναμενόμενο αποτέλεσμα PEGI 3 / ESRB Everyone

3. **App signing**
   - Release → Setup → App integrity → App signing
   - Επίλεξε **Google-managed signing key** (Create new release / Let Google create and manage)
   - Αυτό δεν απαιτεί `.aab`, αλλά είναι προετοιμασία για το επόμενο βήμα

4. **Internal testing testers**
   - Release → Testing → Internal testing → Testers
   - Πρόσθεσε email testers (έως 100 άτομα)

5. **Άλλες ρυθμίσεις**
   - Countries / regions: επίλεξε όπου θες διαθέσιμο το app
   - Developer account: βεβαιώσου ότι εμφανίζεται **GeoloApps**

## Τι ΔΕΝ γίνεται χωρίς `.aab`

- Δημιουργία release (internal/closed/production)
- Upload binary
- Submit for review
- Αυτό είναι ο λόγος που το κουμπί **Next** είναι ανενεργό στο screenshot.

## Βήματα για όταν πάρεις PC (σε 2 μέρες)

1. Clone το repo από GitHub
2. Εγκατάσταση dependencies:
   ```bash
   bun install
   bun add @capacitor/core @capacitor/cli @capacitor/android
   npx cap init "Who Am I?" com.geoloapps.whoami --web-dir dist-pages
   npx cap add android
   ```
3. Build web app:
   ```bash
   GITHUB_PAGES_BASE=/Who-Am-I/ bun run build:pages
   npx cap sync android
   ```
4. Άνοιγμα Android Studio:
   ```bash
   npx cap open android
   ```
5. Build → Generate Signed Bundle / APK → Android App Bundle (.aab)
6. Επίλεξε upload keystore (ή δημιούργησε νέο `.jks` με `keytool`)
7. Upload το `.aab` στο Play Console → Internal testing → Create release
8. Συμπλήρωσε release notes και submit

## Παραδοτέα

- Ολοκληρωμένο store listing στο Play Console
- Έτοιμες όλες οι compliance ρυθμίσεις
- Σαφές checklist για το PC build

## Ρίσκα

- Αν δεν έχεις εγκατεστημένο Android Studio / JDK στο PC, ίσως χρειαστεί επιπλέον χρόνος εγκατάστασης.
- Το package name `com.geoloapps.whoami` δεν αλλάζει μετά το πρώτο upload.
