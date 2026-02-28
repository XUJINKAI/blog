// feed.11ty.js — Atom Feed 组件（数据 + 逻辑 + 渲染）

export const data = {
    permalink: "/feed.xml",
    eleventyExcludeFromCollections: true,
};

// XML 特殊字符转义
function escapeXml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function toISODateString(date, timezone) {
    if (!date) return "";
    if (typeof date === "string") return date;
    const d = date instanceof Date ? date : new Date(date);
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
    }).formatToParts(d);
    const get = (type) => parts.find((p) => p.type === type)?.value || "00";
    const utc = d.getTime();
    const local = new Date(d.toLocaleString("en-US", { timeZone: timezone })).getTime();
    const offsetMin = (local - utc) / 60000;
    const offsetSign = offsetMin >= 0 ? "+" : "-";
    const absOffset = Math.abs(offsetMin);
    const offsetH = String(Math.floor(absOffset / 60)).padStart(2, "0");
    const offsetM = String(absOffset % 60).padStart(2, "0");
    return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}${offsetSign}${offsetH}:${offsetM}`;
}

export function render(data) {
    const { site, collections } = data;
    const tz = site.timezone || "Asia/Shanghai";
    const posts = collections.postsByDate.slice(0, site.feed.posts_limit);
    const latestDate = posts.length > 0 ? toISODateString(posts[0].date, tz) : "";

    const entries = posts.map((post) => {
        const postUrl = `${site.url}${post.data.cleanUrl || post.url.replace(".html", "")}`;
        const publishedDate = toISODateString(post.date, tz);
        const updatedDate = toISODateString(post.data.last_modified_at || post.date, tz);
        const tags = post.data.tags || [];
        const categoryTags = tags.map((tag) => `<category term="${escapeXml(tag)}" />`).join("\n        ");
        const summary = post.data.excerpt || "";

        return `    <entry>
        <title type="html">${escapeXml(post.data.title)}</title>
        <link href="${postUrl}" rel="alternate" type="text/html" title="${escapeXml(post.data.title)}" />
        <published>${publishedDate}</published>
        <updated>${updatedDate}</updated>
        <id>${postUrl}</id>
        ${categoryTags}
        <summary type="html">
            <![CDATA[<blockquote><b>${site.feed.excerpt_tip}</b></blockquote>${summary}]]>
        </summary>
    </entry>`;
    }).join("\n");

    return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="${site.locale}">
    <generator uri="https://www.11ty.dev/" version="3">Eleventy</generator>
    <link href="${site.url}/feed.xml" rel="self" type="application/atom+xml" />
    <link href="${site.url}/" rel="alternate" type="text/html" hreflang="${site.locale}" />
    <updated>${latestDate}</updated>
    <id>${site.url}/feed.xml</id>
    <title type="html">${site.title}</title>
    <subtitle>${escapeXml(site.description)}</subtitle>
    <author>
        <name>${site.author}</name>
    </author>
${entries}
</feed>`;
}
