// sitemap.11ty.js — Sitemap XML 组件

export const data = {
    permalink: "/sitemap.xml",
    eleventyExcludeFromCollections: true,
};

function formatDate(date, timezone) {
    if (!date) return "";
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return String(date);
    return d.toLocaleDateString("sv-SE", { timeZone: timezone });
}

export function render(data) {
    const { site, collections } = data;
    const tz = site.timezone || "Asia/Shanghai";

    const urls = collections.all
        .filter((item) => !item.data.eleventyExcludeFromCollections)
        .map((item) => {
            const loc = `${site.url}${item.data.cleanUrl || item.url.replace(".html", "")}`;
            const lastmod = formatDate(item.data.last_modified_at || item.date, tz);
            return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;
        }).join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}
