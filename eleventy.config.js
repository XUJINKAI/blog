import { registerMarkdown } from "./src/modules/markdown.js";
import { registerFilters } from "./src/modules/filters.js";
import { registerCollections } from "./src/modules/collections.js";
import { registerPreprocessors } from "./src/modules/preprocessors.js";
import { registerSeo } from "./src/modules/seo.js";
import { readFileSync } from "fs";

const siteData = JSON.parse(readFileSync("site.json", "utf-8"));
siteData.debug = process.argv.includes("--serve") || process.env.ELEVENTY_RUN_MODE === "serve";

export default function (eleventyConfig) {

  // --- 全局配置 ---
  eleventyConfig.configureErrorReporting({ allowMissingExtensions: true });
  eleventyConfig.ignores.add("README.md");
  eleventyConfig.addGlobalData("site", siteData);

  // --- 注册功能模块 ---
  registerMarkdown(eleventyConfig);
  registerFilters(eleventyConfig);
  registerCollections(eleventyConfig);
  registerPreprocessors(eleventyConfig, siteData);
  registerSeo(eleventyConfig);

  // --- Passthrough Copy ---
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy({ "src/static": "/" });

  // --- 输出配置 ---
  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
    },
    templateFormats: ["md", "njk", "html", "11ty.js"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
