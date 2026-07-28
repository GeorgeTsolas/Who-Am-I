// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// GITHUB_PAGES=1 switches the build to a static export for GitHub Pages
// hosting. Outside of that env, the Lovable Cloudflare/SSR build is
// unchanged.
const isGithubPages = process.env.GITHUB_PAGES === "1";
const ghBase = process.env.GITHUB_PAGES_BASE ?? "/Who-Am-I/";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    ...(isGithubPages
      ? {
          pages: [{ path: "/" }, { path: "/privacy" }],
        }
      : {}),
  },
  ...(isGithubPages
    ? {
        // Cast: the wrapper's public type only exposes `preset`, but at runtime
        // all fields are forwarded to nitro(). Static preset + prerender routes.
        nitro: {
          preset: "static",
          prerender: {
            routes: ["/", "/privacy"],
            crawlLinks: true,
            failOnError: false,
          },
          baseURL: ghBase,
        } as unknown as { preset?: string },
        vite: {
          base: ghBase,
        },
      }
    : {}),
});
