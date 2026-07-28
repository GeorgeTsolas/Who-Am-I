## Στόχος

Να ολοκληρωθούν όλα τα assets, metadata και οι ρυθμίσεις που χρειάζεται το Google Play πριν φτάσουμε στο build τουτου .aab.

## Τι έχουμε ήδη έτοιμο

- ✅ Core gameplay, tilt controls, scoring, γλώσσες, custom names
- ✅ Privacy Policy σε `/privacy` (live στο GitHub Pages)
- ✅ README με screenshots
- ✅ Feature graphic και app icon 512×512
- ✅ GeoloApps branding
- ✅ Package name: `com.geoloapps.whoami`

## Τι λείπει ακόμα

### 1) Play Store metadata για search

Ο τίτλος "Who Am I?" από μόνος του δεν βοηθάει στο search. Πρέπει να προσθέσουμε keywords στο Play Console:

- **App name στο Play Console**: `Who Am I? — Heads Up Party Game`
- **Short description**: έως 80 χαρακτήρες, με keywords όπως "heads up", "party game", "charades", "guess the celebrity"
- **Full description**: 2-3 παραγράφους + bullet points με τα ίδια keywords
- **Σελίδα `/privacy`**: ήδη live, χρειάζεται μόνο να μπει στο Play Console

### 2) Adaptive launcher icon

Το Play Store απαιτεί adaptive icon για Android 8+. Έχουμε ήδη `public/icon-512.png` και `public/favicon.png`. Θα φτιάξω:

- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png`
- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_background.png`
- όλα τα μεγέθη (mdpi, hdpi, xfont, xhdpi, xxhdpi, xxxhdpi)

### 3) Store screenshots

Έχουμε 5 phone screenshots. Πρέπει να προσθέσουμε:

- 7-inch tablet screenshots (1-2)
- 10-inch tablet screenshots (1-2)

Αν δεν υπάρχει tablet, μπορούμε να χρησιμοποιήσουμε Playwright με tablet viewport.

### 4) App signing keystore

Για το .aab χρειάζεται ένα upload keystore. Επιλογές:

- Google δημιουργεί αυτόματα ένα managed key (συνιστάται για νέους developers)
- Ή δημιουργούμε δικό μας `.jks` με `keytool`

Θα προετοιμάσω οδηγίες για managed signing.

### 5) Data safety declaration

Στο Play Console πρέπει να δηλώσουμε τι δεδομένα συλλέγει η εφαρμογή. Εφόσον είναι 100% on-device:

- No data collected
- No data shared
- No data encrypted (δεν στέλνουμε τίποτα)
- No accounts
- No ads
- No analytics

### 6) Content rating

Συμπλήρωση του content rating questionnaire στο Play Console. Το παιχνίδι είναι family-friendly, PEGI 3 / ESRB Everyone.

### 7) Capacitor setup plan

Επειδή δεν έχεις PC ακόμα, θα ετοιμάσω ένα αναλυτικό step-by-step plan για όταν αποκτήσεις πρόσβαση:

1. Προσθήκη Capacitor dependencies
2. `npx cap add android`
3. `npx cap sync android`
4. Άνοιγμα Android Studio
5. Build → Generate Signed Bundle / APK → Android App Bundle
6. Upload στο Play Console

### 8) Εναλλακτικές χωρίς PC

- **VoltBuilder / Ionic Appflow**: cloud build services, αλλά συνήθως επί πληρωμή
- **GitHub Actions + Android SDK**: μπορεί να κάνει build του .aab, αλλά χρειάζεται Play Console upload χειροκίνητα ή με service account
- **Φίλου PC / internet cafe**: η πιο απλή λύση για one-time build

## Παραδοτέα

1. Προτεινόμενο Play Store title, short description, full description
2. Adaptive launcher icon σε όλα τα μεγέθη
3. Tablet screenshots
4. Οδηγίες για managed app signing
5. Data safety declaration text
6. Step-by-step Capacitor build guide

## Ρίσκα

- Χωρίς PC/Mac δεν μπορούμε να τρέξουμε Android Studio για το τελικό signed AAB. Cloud build services μπορεί να έχουν κόστος.
- Το package name `com.geoloapps.whoami` δεν αλλάζει μετά την πρώτη δημοσίευση.

## Επόμενο βήμα

Χρειάζομαι από εσένα:
- **Short description** (έως 80 χαρακτήρες) ή να σου προτείνω εγώ draft
- Επιβεβαίωση αν θέλεις να προχωρήσω στη δημιουργία των assets (adaptive icon + tablet screenshots) τώρα
- Επιβεβαίωση package name `com.geoloapps.whoami`

Πες μου OK και ξεκινάω.