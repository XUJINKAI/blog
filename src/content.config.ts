import { defineCollection } from "astro:content";
import { postsLoader } from "./loaders/posts.js";
import { postSchema } from "./content/post-schema.js";

const posts = defineCollection({
  loader: postsLoader(),
  schema: postSchema,
});

export const collections = { posts };
