import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Loader } from "astro/loaders";
import { listMarkdownFiles, readMarkdownFile } from "../lib/content.js";

export function postsLoader({ base = "src/posts" } = {}): Loader {
  return {
    name: "blog-posts-loader",

    async load(context) {
      const rootDirectory = fileURLToPath(
        new URL(base + "/", context.config.root),
      );

      await syncPosts(rootDirectory, context);
    },
  };
}

async function syncPosts(
  rootDirectory: string,
  context: Parameters<Loader["load"]>[0],
) {
  const { config, store, parseData, generateDigest } = context;

  const projectRoot = fileURLToPath(config.root);
  const files = await listMarkdownFiles(rootDirectory);
  const entries = [];
  const permalinks = new Map<string, string>();

  for (const filePath of files) {
    const { data: rawData, body } = await readMarkdownFile(filePath);
    const id = path
      .relative(rootDirectory, filePath)
      .replaceAll(path.sep, "/");

    const data = await parseData({
      id,
      data: rawData,
    });

    const existing = permalinks.get(data.permalink);
    if (existing) {
      throw new Error(
        'Duplicate permalink "' + data.permalink + '": ' + existing + " and " + id,
      );
    }
    permalinks.set(data.permalink, id);

    entries.push({
      id,
      data,
      body,
      filePath: path
        .relative(projectRoot, filePath)
        .replaceAll(path.sep, "/"),
      digest: generateDigest({ data, body }),
    });
  }

  store.clear();
  for (const entry of entries) {
    store.set(entry);
  }
}
