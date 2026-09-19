import { z } from "astro/zod";

const dateValue = z.union([
  z.date().refine((value) => !Number.isNaN(value.getTime()), "Invalid date"),
  z.string().refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date"),
]);

const tocSchema = z.object({
  enabled: z.boolean().optional(),
  minLevel: z.number().int().min(1).max(6).optional(),
  maxLevel: z.number().int().min(1).max(6).optional(),
}).strict().refine(
  (value) =>
    value.minLevel === undefined ||
    value.maxLevel === undefined ||
    value.minLevel <= value.maxLevel,
  "toc.minLevel must be less than or equal to toc.maxLevel",
);

export const postSchema = z.object({
  permalink: z.string().trim().min(1).refine(
    (value) => value.startsWith("/posts/"),
    'permalink must start with "/posts/"',
  ),
  title: z.string().trim().min(1),
  date: dateValue,
  last_modified_at: dateValue.nullable().optional(),
  tags: z.union([z.string(), z.array(z.string())]).nullable().optional(),
  emotag: z.string().nullable().optional(),
  keywords: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  published: z.boolean().optional(),
  comments: z.boolean().optional(),
  toc: z.union([z.boolean(), tocSchema]).nullable().optional(),
}).strict();
