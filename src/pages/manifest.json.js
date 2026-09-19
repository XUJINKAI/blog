import { site } from "../lib/site.js";

export function GET() {
  const manifest = {
    short_name: site.title,
    name: site.title,
    icons: [{
      src: "favicon.ico",
      sizes: "64x64 32x32 24x24 16x16",
      type: "image/x-icon",
    }],
    theme_color: site.appearance?.theme_color || "#03a9f4",
    background_color: site.appearance?.background_color || "#ffffff",
  };

  return new Response(JSON.stringify(manifest, null, 4), {
    headers: { "Content-Type": "application/manifest+json; charset=utf-8" },
  });
}
