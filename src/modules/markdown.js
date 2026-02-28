// markdown.js — markdown-it + markdown-it-anchor 配置
import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";

export function registerMarkdown(eleventyConfig) {
    const mdLib = markdownIt({ html: true, linkify: true, typographer: true })
        .use(markdownItAnchor, {
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
    eleventyConfig.setLibrary("md", mdLib);
}
