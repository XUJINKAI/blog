import { readFileSync } from "node:fs";
import { defineConfig } from "astro/config";
import { contentReload } from "./src/integrations/content-reload.js";

const site = JSON.parse(
  readFileSync(new URL("./site.json", import.meta.url), "utf8"),
);

export default defineConfig({
  site: site.url,
  output: "static",
  integrations: [
    contentReload(),
  ],
  build: {
    // Keep the legacy output shape:
    // /about.html, /posts/index.html, /posts/<slug>.html.
    format: "preserve",
  },
});
