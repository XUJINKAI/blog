import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";

const requiredFiles = [
  "dist/index.html",
  "dist/posts/index.html",
  "dist/about.html",
  "dist/404.html",
  "dist/feed.xml",
  "dist/sitemap.xml",
  "dist/manifest.json",
  "dist/assets/css/global.css",
  "dist/assets/css/markdown.css",
  "dist/assets/css/highlight.css",
  "dist/assets/js/posts.js",
  "dist/assets/js/home-projects.js",
];

for (const file of requiredFiles) await access(file, constants.R_OK);

const home = await readFile("dist/index.html", "utf8");
for (const marker of [
  'class="personal-home"',
  'class="project-list"',
  'class="home-writing-list"',
  '/assets/css/global.css',
  '/assets/js/home-projects.js',
]) {
  if (!home.includes(marker)) throw new Error("Homepage output is missing: " + marker);
}

const posts = await readFile("dist/posts/index.html", "utf8");
for (const marker of [
  'class="posts-page"',
  'class="post-selector-panel"',
  'class="post-list"',
  '/assets/js/posts.js',
  'data-tag=',
  '/posts/?tag=',
]) {
  if (!posts.includes(marker)) throw new Error("Posts output is missing: " + marker);
}

const postFiles = posts.match(/href="\/posts\/[^"?]+/g) || [];
if (postFiles.length === 0) throw new Error("Posts page has no post links.");

const articleCandidates = [
  "dist/posts/how-to-structure-docs-for-ai-coding.html",
  "dist/posts/git-commands.html",
];
for (const file of articleCandidates) {
  try {
    const article = await readFile(file, "utf8");
    if (!article.includes('href="/posts/?tag=')) {
      throw new Error("Article tag links do not target /posts/: " + file);
    }
    break;
  } catch (error) {
    if (file === articleCandidates[articleCandidates.length - 1]) throw error;
  }
}

console.log("Static output shape verified.");
