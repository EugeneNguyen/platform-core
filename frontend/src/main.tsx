import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
// Tabler is the project's only design system now — AdminLTE is fully
// removed (dependency, import, and every AdminLTE-only widget's markup; see
// `InfoBox`'s own header for the one that needed a real markup port rather
// than already being Tabler-native). Tabler itself is loaded from
// `index.html` (a pinned CDN `<link>`/`<script>` pair, not an npm import
// here) — see `index.html`'s own comment and `main.TablerCdn.test.ts` for
// why, and why it's asserted at that layer instead of this one.
// Font Awesome Free is the project's icon library, replacing
// `@coreui/icons`/`@coreui/icons-react`. Icons render as CSS classes on an
// `<i>` element (`fa-solid fa-house`), not as React components — so there is
// no icon component to import, only this stylesheet.
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./index.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
