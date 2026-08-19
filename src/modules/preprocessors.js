// preprocessors.js — 预处理器
import markdownIt from "markdown-it";

// 与 markdown.js 中 markdown-it-anchor 的 slugify 保持一致，保证 toc 锚点 ID 匹配
function slugify(s) {
    return s
        .trim()
        .toLowerCase()
        .replace(/[\s]+/g, "-")
        .replace(/[^\w\u4e00-\u9fff-]/g, "");
}

const mdParser = markdownIt({ html: true });

export function registerPreprocessors(eleventyConfig, siteData) {

    // 排除 published:false 的文章
    eleventyConfig.addPreprocessor("filter_unpublished", "md", (data, content) => {
        if (data.published === false) {
            data.permalink = false;
            data.eleventyExcludeFromCollections = true;
        }
    });

    // 处理 md 文件的 permalink，确保以 .html 结尾
    eleventyConfig.addPreprocessor("ensure_html_extension", "md", (data, content) => {
        if (typeof data.permalink === "string") {
            if (!data.permalink.endsWith("/") && !data.permalink.endsWith(".html")) {
                data.permalink = data.permalink + ".html";
            }
        }
    });

    // 为所有文件计算 cleanUrl
    eleventyConfig.addPreprocessor("generate_cleanUrl", "*", (data, content) => {
        let url = data.permalink || data.page?.url;
        if (typeof url === "string") {
            data.cleanUrl = url.replace(/\.html$/, "");
        }
    });

    // 设置 posts 目录下文章的默认值
    eleventyConfig.addPreprocessor("postDefaults", "md", (data, content) => {
        if (data.page?.inputPath?.includes("/posts/")) {
            data.layout = data.layout || "layouts/post.njk";
            data.comments = data.comments ?? true;
            data.displayDate = data.last_modified_at || data.page?.date;
        }
    });

    // 预处理 tags：将空格分隔的字符串拆分为数组
    eleventyConfig.addPreprocessor("splitTags", "md", (data, content) => {
        const raw = data.tags;
        if (!raw) {
            data.tags = [];
        } else if (typeof raw === "string") {
            data.tags = raw.split(/\s+/).filter((t) => t.length > 0);
        } else if (Array.isArray(raw)) {
            data.tags = raw.flatMap((t) => String(t).split(/\s+/)).filter((t) => t.length > 0);
        }
    });

    // 预处理 excerpt：从原始 markdown 提取纯文本摘要
    eleventyConfig.addPreprocessor("excerpt", "md", (data, content) => {
        if (!content) {
            data.excerpt = "";
            return;
        }
        const plain = content
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")  // 移除 <style> 块
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "") // 移除 <script> 块
            .replace(/<[^>]*>/g, "")                          // 移除其他 HTML 标签
            .replace(/^---[\s\S]*?---\s*/m, "")               // 移除可能残留的 frontmatter
            .replace(/!\[.*?\]\(.*?\)/g, "")                  // 移除图片
            .replace(/\[([^\]]*)\]\(.*?\)/g, "$1")            // 链接保留文字
            .replace(/[*_~>#\-|]/g, "")                       // 移除 markdown 标记符号
            .replace(/\s+/g, " ")                             // 合并空白
            .trim();
        const excerptLength = siteData?.appearance?.excerpt_length || 140;
        data.excerpt = plain.slice(0, excerptLength);
    });

    // 预处理 toc：从原始 markdown 提取结构化目录，支持 toc: false 或 toc: { enabled, minLevel, maxLevel }
    eleventyConfig.addPreprocessor("tocItems", "md", (data, content) => {
        const toc = data.toc;

        let enabled = toc !== false;
        let minLevel = 2;
        let maxLevel = 3;

        if (toc && typeof toc === "object") {
            enabled = toc.enabled !== false;
            minLevel = toc.minLevel ?? minLevel;
            maxLevel = toc.maxLevel ?? maxLevel;
        }

        if (!content || !enabled) {
            data.tocItems = [];
            return;
        }

        const tokens = mdParser.parse(content, {});
        const headings = [];

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            if (token.type !== "heading_open") continue;

            const level = Number(token.tag.slice(1));
            if (level < minLevel || level > maxLevel) continue;

            const inline = tokens[i + 1];
            if (!inline || inline.type !== "inline") continue;

            const text = (inline.children ?? [])
                .map((child) => {
                    switch (child.type) {
                        case "text":
                        case "code_inline":
                            return child.content;

                        case "image":
                            return child.content;

                        case "softbreak":
                        case "hardbreak":
                            return " ";

                        default:
                            return "";
                    }
                })
                .join("")
                .trim();

            if (!text) continue;

            headings.push({
                level,
                id: slugify(text),
                text,
            });
        }

        data.tocItems = headings;
    });
}
