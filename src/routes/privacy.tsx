import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy — Who Am I?" },
      {
        name: "description",
        content:
          "Who Am I? is a fully on-device party game. No accounts, no tracking, no analytics — this page explains exactly what data stays on your phone.",
      },
      { property: "og:title", content: "Privacy Policy — Who Am I?" },
      {
        property: "og:description",
        content:
          "No accounts, no tracking, no analytics. Who Am I? runs entirely on your device.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "theme-color", content: "#141c35" },
    ],
  }),
});

const UPDATED = "28 July 2026";

function PrivacyPage() {
  return (
    <div className="mx-auto min-h-dvh max-w-2xl px-5 pb-16 pt-8 text-foreground">
      <div className="mb-6">
        <Link
          to="/"
          className="text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground"
        >
          ← Back to game
        </Link>
      </div>

      <h1 className="display text-4xl font-semibold leading-tight sm:text-5xl">
        Privacy Policy
      </h1>
      <p className="mt-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
        Last updated · {UPDATED}
      </p>

      <div className="prose-invert mt-8 space-y-6 text-[15px] leading-relaxed text-foreground/85">
        <p>
          <strong>Who Am I?</strong> is a party guessing game that runs entirely
          on your device. We do not run servers that collect your data, we do not
          use analytics or advertising SDKs, and we do not require accounts.
        </p>

        <section>
          <h2 className="display mt-2 text-2xl font-semibold text-foreground">
            What we collect
          </h2>
          <p className="mt-2">Nothing is sent to us. The app never transmits gameplay data.</p>
          <p className="mt-2">
            The following is stored locally on your device using your browser or
            operating system's own storage (<code>localStorage</code>) so your
            settings persist between sessions:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Your chosen interface language.</li>
            <li>Any custom names you add to the deck.</li>
            <li>Whether Tilt Mode is on or off.</li>
          </ul>
          <p className="mt-2">
            You can delete this at any time by clearing your browser's site data
            or the app's storage from your device settings.
          </p>
        </section>

        <section>
          <h2 className="display mt-2 text-2xl font-semibold text-foreground">
            Sensors
          </h2>
          <p className="mt-2">
            When Tilt Mode is enabled, the app asks for access to the device's
            motion and orientation sensors so it can detect when you tilt the
            phone up or down. Sensor readings are used only in memory to decide
            correct/skip during a round. They are never stored and never leave
            your device.
          </p>
        </section>

        <section>
          <h2 className="display mt-2 text-2xl font-semibold text-foreground">
            Accounts, tracking and ads
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>No user accounts.</li>
            <li>No analytics or tracking scripts.</li>
            <li>No advertising, no third-party ad SDKs.</li>
            <li>No location, contacts, microphone or camera access.</li>
          </ul>
        </section>

        <section>
          <h2 className="display mt-2 text-2xl font-semibold text-foreground">
            Third parties
          </h2>
          <p className="mt-2">
            The web version loads the Fraunces and Inter fonts from Google Fonts
            so the app looks the same across devices. Loading a font makes a
            standard HTTP request to Google; no game data is sent. When the app
            is installed from an app store, fonts are bundled with the app and
            no such request is made.
          </p>
        </section>

        <section>
          <h2 className="display mt-2 text-2xl font-semibold text-foreground">
            Children
          </h2>
          <p className="mt-2">
            The game is family-friendly and does not collect personal data from
            anyone, including children.
          </p>
        </section>

        <section>
          <h2 className="display mt-2 text-2xl font-semibold text-foreground">
            Changes
          </h2>
          <p className="mt-2">
            If this policy changes, the "Last updated" date above will change
            and the new version will be published at this URL.
          </p>
        </section>

        <section>
          <h2 className="display mt-2 text-2xl font-semibold text-foreground">
            Contact
          </h2>
          <p className="mt-2">
            Questions about this policy? Open an issue on the project's GitHub
            repository or contact the app owner listed on the store page.
          </p>
        </section>
      </div>
    </div>
  );
}
