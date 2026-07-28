## Στόχος

Κάθε push στο `main` του GitHub repo σου να χτίζει αυτόματα την εφαρμογή και να την ανεβάζει στο GitHub Pages, ώστε να έχεις live URL:

```
https://georgetsolas.github.io/Who-Am-I/
https://georgetsolas.github.io/Who-Am-I/privacy   ← για το Play Store
```

Το project είναι sync-αρισμένο με το GitHub σου, οπότε ό,τι αλλαγές κάνω εδώ θα πάνε αυτόματα push στο repo και θα ενεργοποιήσουν το workflow.

## Τι θα φτιάξω

**1) Nitro static build**
Το TanStack Start είναι φτιαγμένο για Cloudflare Workers (SSR). Το GitHub Pages όμως σερβίρει μόνο static αρχεία. Αλλάζω τον nitro preset σε `static` και ενεργοποιώ prerender για τα δύο routes (`/`, `/privacy`) — δουλεύει γιατί το app είναι 100% client-side (καμία server function, καμία DB).

**2) Base path για subpath hosting**
Το site θα ζει κάτω από `/Who-Am-I/`, οπότε:
- Vite `base: '/Who-Am-I/'` (μόνο σε production build)
- Router `basepath: '/Who-Am-I/'`
- `404.html` fallback ώστε τα deep links (π.χ. refresh στο `/privacy`) να μη σκάνε

**3) GitHub Actions workflow** (`.github/workflows/deploy.yml`)
Τρέχει σε κάθε push στο `main`:
- `bun install`
- `bun run build`
- Upload του output → `actions/deploy-pages`

**4) GitHub Pages source setting** ⚠️
Αυτό είναι το ΜΟΝΟ που πρέπει να αλλάξεις εσύ χειροκίνητα (μια φορά):
Στο ίδιο screen που έστειλες, στο **Source** → άλλαξέ το από **"Deploy from a branch"** σε **"GitHub Actions"**. Θα σου το πω ξανά όταν κάνουμε build.

## Παραδοτέα

- Live URL: `https://georgetsolas.github.io/Who-Am-I/`
- Privacy URL (για Play Console): `https://georgetsolas.github.io/Who-Am-I/privacy`
- Auto-deploy σε κάθε push
- Το Lovable preview συνεχίζει να δουλεύει κανονικά

## Τεχνικές λεπτομέρειες

- Αλλαγή σε `vite.config.ts`: nitro preset `static` με prerender routes `['/', '/privacy']`, `base` conditional.
- Αλλαγή σε `src/router.tsx`: `basepath: import.meta.env.BASE_URL`.
- Νέο `.github/workflows/deploy.yml` με permissions για Pages + oidc.
- Νέο `public/404.html` (copy του `index.html`) για SPA fallback.
- Έλεγχος build τοπικά πριν σου δώσω πράσινο φως.

## Ρίσκα

- Αν το nitro static preset δεν prerender-άρει σωστά το `__root` shell, θα κάνω fallback σε καθαρό Vite SPA build (μικρή τροποποίηση). Θα το επιβεβαιώσω με τοπικό build πριν σου πω ότι είναι έτοιμο.
- Αν αλλάξεις το repo name από `Who-Am-I`, το base path πρέπει να αλλάξει και αυτό.

Πες μου OK και ξεκινάω.
