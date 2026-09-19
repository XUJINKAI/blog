import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";

const posts = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/posts",
    retainBody: true,
    deferRender: true,
  }),
});

const pages = defineCollection({
  loader: glob({
    pattern: "about.md",
    base: "./src",
    retainBody: true,
    deferRender: true,
  }),
});

export const collections = { posts, pages };
