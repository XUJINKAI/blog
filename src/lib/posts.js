import { getCollection } from "astro:content";
import { activityTime } from "./dates.js";
import { site } from "./site.js";

export async function getPublishedPosts() {
  const entries = await getCollection(
    "posts",
    ({ data }) => data.published !== false,
  );

  return entries.map(normalizePost);
}

export async function getPostsByDate() {
  return [...(await getPublishedPosts())].sort(byActivityDescending);
}

export async function getHomePosts() {
  const sorted = await getPostsByDate();
  const recent = sorted.slice(0, 2);
  const emotagged = sorted.filter((post) => Boolean(post.emotag));
  const unique = new Map();

  for (const post of [...recent, ...emotagged]) {
    unique.set(post.cleanUrl, post);
  }

  return [...unique.values()].sort(byActivityDescending).slice(0, 5);
}

export async function getPostRoutes() {
  const posts = await getPublishedPosts();

  return posts.map((post) => ({
    params: { slug: post.cleanUrl.slice("/posts/".length) },
    props: { post },
  }));
}

function normalizePost(entry) {
  const data = entry.data;
  const permalink = data.permalink.trim();
  const cleanUrl = permalink.endsWith(".html")
    ? permalink.slice(0, -".html".length)
    : permalink;
  const pageUrl =
    permalink.endsWith("/") || permalink.endsWith(".html")
      ? permalink
      : permalink + ".html";
  const body = entry.body || "";
  const tags = normalizeTags(data.tags);
  const date = data.date;
  const lastModified = data.last_modified_at || null;

  return {
    sourcePath: entry.id,
    title: data.title,
    permalink,
    pageUrl,
    cleanUrl,
    date,
    lastModified,
    displayDate: lastModified || date,
    tags,
    emotag: data.emotag || "",
    keywords: data.keywords || "",
    description: data.description || "",
    comments: data.comments ?? true,
    toc: data.toc,
    body,
    excerpt: createExcerpt(body),
  };
}

function normalizeTags(raw) {
  if (!raw) return [];

  const values = Array.isArray(raw) ? raw : [raw];
  return values
    .flatMap((value) => String(value).split(/\s+/))
    .filter(Boolean);
}

function createExcerpt(content) {
  const plain = String(content || "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/^---[\s\S]*?---\s*/m, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]*)\]\(.*?\)/g, "$1")
    .replace(/[*_~>#\-|]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return plain.slice(0, site.appearance?.excerpt_length || 140);
}

function byActivityDescending(left, right) {
  return activityTime(right) - activityTime(left);
}
