import { defineCollection } from "astro:content";
import { postsLoader } from "./loaders/posts.ts";
import { postSchema } from "./content/post-schema.ts";

const posts = defineCollection({
  loader: postsLoader(),
  schema: postSchema,
});

export const collections = { posts };
