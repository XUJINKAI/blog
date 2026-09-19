import { getPostsByDate } from "../lib/posts.js";
import { site } from "../lib/site.js";
import { dateFormat } from "../lib/dates.js";

export async function GET() {
  const posts = await getPostsByDate();
  const urls = [
    { loc: site.url + "/" },
    { loc: site.url + "/posts/" },
    { loc: site.url + "/about" },
    ...posts.map((post) => ({
      loc: site.url + post.cleanUrl,
      lastmod: dateFormat(post.lastModified || post.date, site.timezone),
    })),
  ];

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls.map((item) => [
      "  <url>",
      "    <loc>" + item.loc + "</loc>",
      item.lastmod ? "    <lastmod>" + item.lastmod + "</lastmod>" : null,
      "  </url>",
    ].filter(Boolean).join("\n")).join("\n"),
    "</urlset>",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
