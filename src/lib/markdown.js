import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import hljs from "highlight.js";
import { site } from "./site.js";

export function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[\s]+/g, "-")
    .replace(/[^\w\u4e00-\u9fff-]/g, "");
}

const options = {
  html: true,
  linkify: true,
  typographer: true,
  highlight(code, language) {
    if (language && hljs.getLanguage(language)) {
      return hljs.highlight(code, {
        language,
        ignoreIllegals: true,
      }).value;
    }
    return "";
  },
};

const articleMarkdown = markdownIt(options).use(markdownItAnchor, {
  permalink: markdownItAnchor.permalink.linkInsideHeader({
    class: "anchor",
    symbol: '<span class="octicon octicon-link"></span>',
    placement: "before",
    ariaHidden: true,
  }),
  level: [1, 2, 3, 4, 5, 6],
  slugify,
});

const fragmentMarkdown = markdownIt(options);
configureFragmentLinks(fragmentMarkdown);
configureFragmentImages(fragmentMarkdown);

const tocParser = markdownIt({ html: true });

export function renderMarkdown(content) {
  return articleMarkdown.render(content || "");
}

export function renderFragment(content) {
  return fragmentMarkdown.render(content || "");
}

export function extractTocItems(content, toc) {
  let enabled = toc !== false;
  let minLevel = 2;
  let maxLevel = 3;

  if (toc && typeof toc === "object") {
    enabled = toc.enabled !== false;
    minLevel = toc.minLevel ?? minLevel;
    maxLevel = toc.maxLevel ?? maxLevel;
  }

  if (!content || !enabled) return [];

  const tokens = tocParser.parse(content, {});
  const headings = [];

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token.type !== "heading_open") continue;

    const level = Number(token.tag.slice(1));
    if (level < minLevel || level > maxLevel) continue;

    const inline = tokens[index + 1];
    if (!inline || inline.type !== "inline") continue;

    const text = (inline.children ?? [])
      .map((child) => {
        switch (child.type) {
          case "text":
          case "code_inline":
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
    headings.push({ level, id: slugify(text), text });
  }

  return headings;
}

function configureFragmentLinks(markdown) {
  const defaultLinkOpen =
    markdown.renderer.rules.link_open ||
    ((tokens, index, renderOptions, env, self) =>
      self.renderToken(tokens, index, renderOptions));

  markdown.renderer.rules.link_open = (tokens, index, renderOptions, env, self) => {
    const href = tokens[index].attrGet("href");
    if (isExternalLink(href)) {
      tokens[index].attrSet("target", "_blank");
      tokens[index].attrSet("rel", "noopener noreferrer");
    }
    return defaultLinkOpen(tokens, index, renderOptions, env, self);
  };
}

function configureFragmentImages(markdown) {
  const defaultImage =
    markdown.renderer.rules.image ||
    ((tokens, index, renderOptions, env, self) =>
      self.renderToken(tokens, index, renderOptions));

  markdown.renderer.rules.image = (tokens, index, renderOptions, env, self) => {
    const token = tokens[index];
    token.attrSet("loading", "lazy");
    token.attrSet("decoding", "async");
    token.attrSet("fetchpriority", "low");
    return defaultImage(tokens, index, renderOptions, env, self);
  };
}

function isExternalLink(href) {
  if (!href || !/^https?:\/\//i.test(href)) return false;

  try {
    return new URL(href).origin !== new URL(site.url).origin;
  } catch {
    return false;
  }
}
