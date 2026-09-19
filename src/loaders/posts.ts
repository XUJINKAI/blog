import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Loader } from "astro/loaders";
import { listMarkdownFiles, readMarkdownFile } from "../lib/content.js";

export function postsLoader({ base = "src/posts" } = {}): Loader {
  return {
    name: "blog-posts-loader",

    async load(context) {
      const { config, watcher } = context;
      const rootDirectory = fileURLToPath(new URL(base + "/", config.root));

      await syncPosts(rootDirectory, context);

      if (!watcher) return;

      watcher.add(rootDirectory);

      let timer: ReturnType<typeof setTimeout> | undefined;
      const scheduleSync = (changedPath: string) => {
        if (!isMarkdownInside(changedPath, rootDirectory)) return;

        clearTimeout(timer);
        timer = setTimeout(() => {
          void syncPosts(rootDirectory, context).catch((error) => {
            context.logger.error(
              error instanceof Error ? error.message : String(error),
            );
          });
        }, 30);
      };

      watcher.on("add", scheduleSync);
      watcher.on("change", scheduleSync);
      watcher.on("unlink", scheduleSync);
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

function isMarkdownInside(changedPath: string, rootDirectory: string) {
  if (!changedPath.toLowerCase().endsWith(".md")) return false;

  const absolutePath = path.resolve(changedPath);
  return (
    absolutePath === rootDirectory ||
    absolutePath.startsWith(rootDirectory + path.sep)
  );
}
