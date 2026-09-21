import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ThemeProvider } from "@/theme/ThemeContext";
import { App } from "@/App";
import "@/index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // The Electron window opens and starts fetching before the backend API
      // is actually up (Postgres connect + migrations + Garmin/iCloud/
      // weather/R6 syncs all run first) -- the default retry budget (3
      // attempts, ~7s total) gives up well before that finishes. This gives
      // ~80s of patient retrying instead, so pages recover on their own
      // rather than getting stuck on "Data unavailable" from a cold start.
      retry: 10,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);
