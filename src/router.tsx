import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  // Vite injects import.meta.env.BASE_URL (defaults to "/"). When we build for
  // GitHub Pages the base becomes "/Who-Am-I/" — strip the trailing slash for
  // TanStack Router's basepath.
  const rawBase = import.meta.env.BASE_URL ?? "/";
  const basepath = rawBase === "/" ? undefined : rawBase.replace(/\/$/, "");

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    ...(basepath ? { basepath } : {}),
  });

  return router;
};
