import { readFileSync } from "node:fs";
import { defineConfig } from "astro/config";

const site = JSON.parse(
  readFileSync(new URL("./site.json", import.meta.url), "utf8"),
);

export default defineConfig({
  site: site.url,
  output: "static",
  build: {
    // Keep the legacy output shape:
    // /about.html, /posts/index.html, /posts/<slug>.html.
    format: "preserve",
  },
});
