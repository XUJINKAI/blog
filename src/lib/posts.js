import path from "node:path";
import { activityTime } from "./dates.js";
import { listMarkdownFiles, readMarkdownFile } from "./content.js";
import { site } from "./site.js";

const postsDirectory = path.join(process.cwd(), "src", "posts");
let publishedPostsPromise;

export function getPublishedPosts() {
  if (!publishedPostsPromise) {
    publishedPostsPromise = loadPosts();
  }
  return publishedPostsPromise;
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

  return posts.map((post) => {
    if (!post.cleanUrl.startsWith("/posts/")) {
      throw new Error(
        "Post permalink must stay under /posts/: " + post.sourcePath + " -> " + post.cleanUrl,
      );
    }

    return {
      params: { slug: post.cleanUrl.slice("/posts/".length) },
      props: { post },
    };
  });
}

async function loadPosts() {
  const files = await listMarkdownFiles(postsDirectory);
  const posts = [];

  for (const filePath of files) {
    const { data, body } = await readMarkdownFile(filePath);
    if (data.published === false) continue;

    posts.push(normalizePost({
      data,
      body,
      sourcePath: path.relative(postsDirectory, filePath).replaceAll(path.sep, "/"),
    }));
  }

  return posts;
}

function normalizePost(entry) {
  const data = entry.data ?? {};
  const permalink = normalizePermalink(data.permalink, entry.sourcePath);
  const cleanUrl = permalink.endsWith(".html")
    ? permalink.slice(0, -".html".length)
    : permalink;
  const pageUrl =
    permalink.endsWith("/") || permalink.endsWith(".html")
      ? permalink
      : permalink + ".html";
  const body = entry.body || "";
  const tags = normalizeTags(data.tags);
  const date = data.date || null;
  const lastModified = data.last_modified_at || null;

  return {
    sourcePath: entry.sourcePath,
    title: data.title || "",
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

function normalizePermalink(value, sourcePath) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error('Post is missing required frontmatter "permalink": ' + sourcePath);
  }

  const permalink = value.trim();
  return permalink.startsWith("/") ? permalink : "/" + permalink;
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
