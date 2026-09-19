import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://xujinkai.net",
  output: "static",
  build: {
    // Keep the legacy output shape:
    // /about.html, /posts/index.html, /posts/<slug>.html.
    format: "preserve",
  },
});
