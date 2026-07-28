# Play Console Checklist — Who Am I?

> Βήμα προς βήμα τι να κάνεις στο Google Play Console τώρα, πριν πάρεις PC για το `.aab`.

## ✅ Pre-flight — έχεις ήδη έτοιμα

| Asset | Path | Status |
|-------|------|--------|
| App icon 512×512 | `docs/store-assets/android-launcher-icons/playstore/ic_launcher-playstore.png` | ✅ |
| Feature graphic 1024×500 | `src/assets/feature-graphic.png` | ✅ |
| Phone screenshots | `docs/screenshots/*.png` | ✅ |
| 7-inch tablet screenshots | `docs/screenshots/tablet-7inch/*.png` | ✅ |
| 10-inch tablet screenshots | `docs/screenshots/tablet-10inch/*.png` | ✅ |
| Play Store metadata | `docs/store-assets/play-store-metadata.md` | ✅ |
| Data safety answers | `docs/store-assets/data-safety.md` | ✅ |
| Capacitor build guide | `docs/store-assets/capacitor-build-guide.md` | ✅ |
| Privacy policy URL | `https://georgetsolas.github.io/Who-Am-I/privacy` | ✅ |
| Package name | `com.geoloapps.whoami` | ✅ |

---

## 📝 Store listing (γίνεται τώρα)

Πήγαινε **Play Console → Grow → Store presence → Main store listing**.

### 1. App details

- **App name:** `Who Am I? — Heads Up Party Game`
- **Short description:** `Heads Up party game: guess celebrities, characters & myths with friends.`
- **Full description:** αντιγραφή από `docs/store-assets/play-store-metadata.md` (ελληνικά/αγγλικά όπως θες)

### 2. Graphics

Ανέβασε με αυτή τη σειρά:

1. **App icon** → `docs/store-assets/android-launcher-icons/playstore/ic_launcher-playstore.png`
2. **Feature graphic** → `src/assets/feature-graphic.png`
3. **Phone screenshots** → όλα τα `docs/screenshots/*.png`
4. **7-inch tablet screenshots** → όλα τα `docs/screenshots/tablet-7inch/*.png`
5. **10-inch tablet screenshots** → όλα τα `docs/screenshots/tablet-10inch/*.png`

> Το Play Console δείχνει warning αν λείπουν tablet screenshots — τα έχουμε έτοιμα.

### 3. Categorization

- **Category:** Games
- **Tags:** `Heads Up`, `Party Game`, `Guessing Game`, `Charades`, `Family Game`, `Offline Games`, `No Wifi Games`, `Group Games`, `Who Am I Game`
- **Content rating:** θα το κάνεις στο επόμενο section

---

## 🔒 Privacy & compliance (γίνεται τώρα)

### 4. Privacy policy

Πήγαινε **Play Console → App content → Privacy policy**.

- **Privacy policy URL:** `https://georgetsolas.github.io/Who-Am-I/privacy`

### 5. Data safety

Πήγαινε **Play Console → App content → Data safety**.

| Ερώτηση | Απάντηση |
|---------|----------|
| Does your app collect or share any of the required user data types? | **No** |
| Does your app collect or share any of the optional user data types? | **No** |
| Is all user data collected by your app encrypted in transit? | **No** (ή "No data is transmitted") |
| Do you provide a way for users to request deletion of their data? | **No** |

> Σημείωση: επειδή δεν συλλέγουμε δεδομένα, οι ερωτήσεις encryption/deletion απαντώνται **No**. Το Play Console μπορεί να δείξει warning, αλλά είναι σωστό για on-device app.

### 6. Content rating

Πήγαινε **Play Console → App content → Content rating**.

- Email: το email του developer account
- Questionnaire: απάντησε **No** σε όλες τις ερωτήσεις (δεν υπάρχει βία, σεξουαλικό περιεχόμενο, χρήματα, τζόγος, φόβος, drugs κλπ.)
- Αναμενόμενο αποτέλεσμα: **PEGI 3 / ESRB Everyone**

---

## 🔑 App signing (γίνεται τώρα)

Πήγαινε **Play Console → Release → Setup → App integrity → App signing**.

1. Επίλεξε **Create new release** (ή **Use Google-generated key**)
2. Άσε τη Google να δημιουργήσει και να διαχειρίζεται το signing key
3. Μην κάνεις τίποτα άλλο εδώ — το upload key θα το φτιάξεις στο PC σε 2 μέρες

> Αν δεις "Releases are signed by Google Play" όπως στο screenshot, είσαι σε καλό δρόμο.

---

## 🧪 Testers (γίνεται τώρα)

Πήγαινε **Play Console → Release → Testing → Internal testing → Testers**.

- Πρόσθεσε email list (π.χ. τους φίλους σου) — έως 100 testers
- Αυτό θα ενεργοποιηθεί αυτόματα μόλις ανεβάσεις το `.aab`

---

## 🌍 Άλλες ρυθμίσεις (γίνεται τώρα)

### 7. Countries / regions

Πήγαινε **Play Console → Release → Countries / regions**.

- Επίλεξε τις χώρες όπου θες να είναι διαθέσιμο το app (π.χ. όλες ή Ευρώπη + ΗΠΑ + Καναδάς)

### 8. Developer name

Βεβαιώσου ότι εμφανίζεται **GeoloApps**:

- **Play Console → Settings → Developer account → Account details**
- **Developer name:** `GeoloApps`

---

## ❌ Τι ΔΕΝ γίνεται χωρίς `.aab`

- Δημιουργία internal testing release
- Upload binary
- Submit for review
- Αυτό είναι γιατί το κουμπί **Next** είναι γκριζαρισμένο στο screenshot σου.

---

## 💻 Checklist για όταν πάρεις PC (σε 2 μέρες)

### Προαπαιτούμενα στο PC

- [ ] Android Studio (τελευταία stable)
- [ ] JDK 17+ (έρχεται συνήθως με Android Studio)
- [ ] Node.js + bun (ή npm)
- [ ] Git

### Εντολές

```bash
# 1. Clone repo
git clone https://github.com/GeorgeTsolas/Who-Am-I.git
cd Who-Am-I

# 2. Install deps
bun install

# 3. Add Capacitor
bun add @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Who Am I?" com.geoloapps.whoami --web-dir dist-pages
npx cap add android

# 4. Build web app
GITHUB_PAGES_BASE=/Who-Am-I/ bun run build:pages
npx cap sync android

# 5. Άνοιγμα Android Studio
npx cap open android
```

### Μέσα από Android Studio

- [ ] Build → Generate Signed Bundle / APK...
- [ ] Επίλεξε **Android App Bundle (.aab)**
- [ ] Δημιούργησε ή επίλεξε upload keystore
- [ ] Build
- [ ] Βρες το `.aab` σε `android/app/release/app-release.aab`

### Upload

- [ ] Play Console → Release → Internal testing → Create release
- [ ] Upload το `.aab`
- [ ] Release notes: `Initial release`
- [ ] Review → Submit

---

## 🎯 Τελικός στόχος

Μετά από αυτά τα βήματα, το app θα είναι σε **internal testing** και οι testers θα μπορούν να το κατεβάσουν από το Play Store.
