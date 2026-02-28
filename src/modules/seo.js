// seo.js — SEO computed data，预计算模板需要的 SEO 变量

export function registerSeo(eleventyConfig) {
    eleventyConfig.addGlobalData("eleventyComputed", {
        seo: (data) => {
            const site = data.site;
            if (!site) return {};

            const pageUrl = data.page?.url || "/";
            const cleanUrl = data.cleanUrl || pageUrl.replace(".html", "");
            const canonicalUrl = `${site.url}${cleanUrl}`;
            const isPost = data.layout === "layouts/post.njk";

            // 页面标题
            const pageTitle = data.title
                ? `${data.title} | ${site.title}`
                : `${site.title} | ${site.description}`;

            // OG 类型
            const ogType = isPost ? "article" : "website";

            // 描述
            const description = data.description || site.description;
            const safeDescription = description.replace(/"/g, '\\"');

            // 标题（用于 OG/Twitter）
            const ogTitle = data.title || site.title;
            const safeTitle = String(ogTitle).replace(/"/g, '\\"');

            // 日期格式化为 ISO 字符串（带时区）
            const formatDate = (d) => {
                if (!d) return undefined;
                if (typeof d === "string") return d;
                return d instanceof Date ? d.toISOString() : new Date(d).toISOString();
            };

            // JSON-LD 结构化数据
            let jsonLd;
            if (isPost) {
                jsonLd = JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "BlogPosting",
                    author: { "@type": "Person", name: site.author },
                    dateModified: formatDate(data.last_modified_at || data.page?.date),
                    datePublished: formatDate(data.page?.date),
                    description: description,
                    headline: ogTitle,
                    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
                    url: canonicalUrl,
                });
            } else {
                jsonLd = JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebPage",
                    author: { "@type": "Person", name: site.author },
                    description: description,
                    headline: ogTitle,
                    url: canonicalUrl,
                });
            }

            return {
                canonicalUrl,
                pageTitle,
                ogType,
                ogTitle,
                description,
                safeDescription,
                safeTitle,
                jsonLd,
                isPost,
            };
        },
    });
}
