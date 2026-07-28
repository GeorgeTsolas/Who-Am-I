# Tilt-to-answer (correct / skip)

Το tilt δεν λειτουργεί γιατί δεν έχει υλοποιηθεί — μόνο το κείμενο-οδηγία υπάρχει. Είναι εφικτό στο web, με δύο σημαντικά caveats:

- **iOS Safari**: απαιτεί explicit permission με `DeviceOrientationEvent.requestPermission()` και μόνο μετά από user gesture (tap).
- **HTTPS**: το device orientation API δουλεύει μόνο σε secure context. Στο Lovable preview/published είμαστε ήδη σε HTTPS, οπότε ok.

## Πώς θα δουλεύει

Στο "Playing" screen το τηλέφωνο κρατιέται landscape στο μέτωπο (οθόνη προς φίλους). Χρησιμοποιούμε το `beta` (front-back tilt) για να ανιχνεύσουμε:

- **Tilt DOWN** (κορυφή προς τα κάτω) → Correct (πράσινο flash + επόμενο)
- **Tilt UP** (κορυφή προς τα πάνω) → Skip (κόκκινο flash + επόμενο)
- **Neutral zone** στη μέση για να μη κάνει mis-trigger

State machine ανά κάρτα: `neutral` → `tilted` → πρέπει να επιστρέψει στο `neutral` πριν καταγραφεί νέα απάντηση (αλλιώς spam triggers).

## Ready screen: iOS permission

Στο "Get ready — tap to start" tap:
1. Αν `typeof DeviceOrientationEvent.requestPermission === 'function'` → κάνε το request. Αν denied, το game παίζει κανονικά αλλά μόνο με τα κουμπιά (fallback).
2. Αλλιώς (Android/desktop) → attach listener κατευθείαν.

Έτσι το permission ζητιέται μία φορά στο σωστό user gesture.

## Thresholds (landscape)

Το τηλέφωνο είναι landscape στο μέτωπο, οπότε στην πράξη χρησιμοποιούμε συνδυασμό `beta`/`gamma` ανάλογα με το `window.screen.orientation.angle`:

- neutral: |angle| < ~25°
- trigger correct: angle > ~55°
- trigger skip: angle < -55°
- reset στο neutral με hysteresis (~35°) για σταθερότητα

## Τι δεν αλλάζει

- Τα κουμπιά "Got it" / "Skip" παραμένουν πάντα διαθέσιμα ως fallback (χρήσιμο σε desktop preview, σε συσκευές που αρνούνται permission, ή αν κάποιος προτιμά).
- Το υπάρχον game logic (timer, score, flashes) δεν πειράζεται — απλώς το tilt καλεί τα ίδια handlers.

## Τεχνική υλοποίηση

- Νέο hook `src/hooks/use-tilt-controls.ts`:
  - args: `{ enabled: boolean, onCorrect, onSkip }`
  - επιστρέφει: `{ requestPermission, permissionState: 'granted'|'denied'|'unsupported'|'pending' }`
  - Εσωτερικά κρατά `useRef` για την τρέχουσα φάση (neutral/awaiting-reset) και για throttling.
- Στο `src/routes/index.tsx`:
  - Στο Ready screen tap handler → `await requestPermission()` πριν το `setPhase('playing')`.
  - Στο Playing phase → `useTiltControls({ enabled: phase === 'playing' && !paused, onCorrect: handleCorrect, onSkip: handleSkip })`.
  - Μικρό ένδειξη κάτω από τα κουμπιά: "Tilt down = correct · Tilt up = skip" (localized), και σε permission `denied` δείχνουμε subtle hint "Χρησιμοποίησε τα κουμπιά".

## Δυσκολία

Μικρή προς μέτρια — ο κώδικας είναι ~80 γραμμές. Το πιο tricky είναι το iOS permission gate και το να μην κάνει διπλό trigger. Έχω επιλέξει hysteresis + await-reset για αυτό.
