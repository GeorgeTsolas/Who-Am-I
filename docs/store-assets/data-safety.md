# Data Safety Declaration — Who Am I?

> Απαντήσεις για το Play Console → App content → Data safety.

## Overview

Η εφαρμογή **Who Am I?** λειτουργεί 100% on-device. Δεν συλλέγουμε, δεν αποθηκεύουμε και δεν μοιραζόμαστε προσωπικά δεδομένα χρηστών.

## Data collection

**Does your app collect or share any of the required user data types?**

```
No
```

**Does your app collect or share any of the optional user data types?**

```
No
```

## Data handling

**Is all user data collected by your app encrypted in transit?**

```
No data is transmitted
```

> Επειδή δεν στέλνουμε δεδομένα, η ερώτηση για encryption in transit δεν ισχύει. Αν το Play Console απαιτεί boolean, επιλέγουμε **No**.

**Do you provide a way for users to request deletion of their data?**

```
No
```

> Δεν υπάρχουν δεδομένα για διαγραφή. Ο χρήστης μπορεί να διαγράψει το local storage από τις ρυθμίσεις της συσκευής.

## Security practices

- Δεν απαιτούνται accounts.
- Δεν χρησιμοποιούμε analytics ή tracking.
- Δεν εμφανίζονται ads.
- Δεν ζητείται πρόσβαση σε location, contacts, microphone ή camera.
- Οι ρυθμίσεις (γλώσσα, custom names, tilt mode) αποθηκεύονται μόνο τοπικά στο `localStorage` του WebView.

## Privacy Policy URL

```
https://georgetsolas.github.io/Who-Am-I/privacy
```
