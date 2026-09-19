import { getPostsByDate } from "../lib/posts.js";
import { site } from "../lib/site.js";
import { dateFormat } from "../lib/dates.js";

export async function GET() {
  const posts = await getPostsByDate();
  const today = dateFormat(new Date(), site.timezone);
  const urls = [
    { loc: site.url + "/", lastmod: today },
    { loc: site.url + "/posts/", lastmod: today },
    { loc: site.url + "/about", lastmod: today },
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
      "    <lastmod>" + item.lastmod + "</lastmod>",
      "  </url>",
    ].join("\n")).join("\n"),
    "</urlset>",
  ].join("\n");

  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
