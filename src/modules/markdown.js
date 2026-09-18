// markdown.js — markdown-it + markdown-it-anchor 配置
import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import hljs from "highlight.js";

export function registerMarkdown(eleventyConfig) {
    const options = {
        html: true,
        linkify: true,
        typographer: true,
        highlight(str, lang) {
            if (lang && hljs.getLanguage(lang)) {
                return hljs.highlight(str, {
                    language: lang,
                    ignoreIllegals: true,
                }).value;
            }

            return "";
        },
    };

    const mdLib = markdownIt(options).use(markdownItAnchor, {
        permalink: markdownItAnchor.permalink.linkInsideHeader({
            class: "anchor",
            symbol: '<span class="octicon octicon-link"></span>',
            placement: "before",
            ariaHidden: true,
        }),
        level: [1, 2, 3, 4, 5, 6],
        slugify: (s) =>
            s.trim().toLowerCase().replace(/[\s]+/g, "-").replace(/[^\w\u4e00-\u9fff-]/g, ""),
    });

    // 首页等组合式内容块使用同一套 Markdown 语法，但不为标题注入文章锚点。
    const fragmentMdLib = markdownIt(options);
    configureFragmentLinks(fragmentMdLib);

    eleventyConfig.setLibrary("md", mdLib);
    eleventyConfig.addFilter("markdownFragment", (content) => fragmentMdLib.render(content || ""));
}

function configureFragmentLinks(md) {
    const defaultLinkOpen =
        md.renderer.rules.link_open ||
        ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));

    md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
        const href = tokens[idx].attrGet("href");
        if (isExternalLink(href)) {
            tokens[idx].attrSet("target", "_blank");
            tokens[idx].attrSet("rel", "noopener noreferrer");
        }
        return defaultLinkOpen(tokens, idx, options, env, self);
    };
}

function isExternalLink(href) {
    if (!href || !/^https?:\/\//i.test(href)) return false;

    try {
        return new URL(href).origin !== new URL("https://xujinkai.net").origin;
    } catch {
        return false;
    }
}
