import { getPostsByDate } from "../lib/posts.js";
import { site } from "../lib/site.js";
import { toISODate } from "../lib/dates.js";

export async function GET() {
  const posts = (await getPostsByDate()).slice(0, site.feed.posts_limit);
  const latestDate = posts.length > 0 ? toISODate(posts[0].date, site.timezone) : "";

  const entries = posts.map((post) => {
    const postUrl = site.url + post.cleanUrl;
    const categories = post.tags
      .map((tag) => '        <category term="' + escapeXml(tag) + '" />')
      .join("\n");

    return [
      "    <entry>",
      '        <title type="html">' + escapeXml(post.title) + "</title>",
      '        <link href="' + postUrl + '" rel="alternate" type="text/html" title="' + escapeXml(post.title) + '" />',
      "        <published>" + toISODate(post.date, site.timezone) + "</published>",
      "        <updated>" + toISODate(post.lastModified || post.date, site.timezone) + "</updated>",
      "        <id>" + postUrl + "</id>",
      categories,
      '        <summary type="html">',
      "            <![CDATA[<blockquote><b>" + site.feed.excerpt_tip + "</b></blockquote>" + post.excerpt + "]]>",
      "        </summary>",
      "    </entry>",
    ].filter(Boolean).join("\n");
  }).join("\n");

  const body = [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="' + site.locale + '">',
    '    <generator uri="https://astro.build/" version="7">Astro</generator>',
    '    <link href="' + site.url + '/feed.xml" rel="self" type="application/atom+xml" />',
    '    <link href="' + site.url + '/" rel="alternate" type="text/html" hreflang="' + site.locale + '" />',
    "    <updated>" + latestDate + "</updated>",
    "    <id>" + site.url + "/feed.xml</id>",
    '    <title type="html">' + site.title + "</title>",
    "    <subtitle>" + escapeXml(site.description) + "</subtitle>",
    "    <author>",
    "        <name>" + site.author + "</name>",
    "    </author>",
    entries,
    "</feed>",
  ].join("\n");

  return new Response(body, { headers: { "Content-Type": "application/atom+xml; charset=utf-8" } });
}

function escapeXml(value) {
  if (!value) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
