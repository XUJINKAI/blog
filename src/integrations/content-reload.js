import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../../", import.meta.url));
const sourceDirectory = path.join(projectRoot, "src");
const postsDirectory = path.join(sourceDirectory, "posts");

export function contentReload() {
  return {
    name: "content-reload",

    hooks: {
      "astro:server:setup": ({ server, refreshContent, logger }) => {
        let timer;
        let pending = new Set();
        let refreshQueue = Promise.resolve();

        const schedule = (changedPath) => {
          const filePath = path.resolve(changedPath);
          if (!isMarkdownInside(filePath, sourceDirectory)) return;

          pending.add(filePath);
          clearTimeout(timer);

          timer = setTimeout(() => {
            const changedFiles = [...pending];
            pending = new Set();

            refreshQueue = refreshQueue
              .then(async () => {
                if (changedFiles.some((file) => isInside(file, postsDirectory))) {
                  await refreshContent({ loaders: ["blog-posts-loader"] });
                }

                server.ws.send({ type: "full-reload" });
              })
              .catch((error) => {
                logger.error(
                  error instanceof Error ? error.message : String(error),
                );
              });
          }, 30);
        };

        server.watcher.on("add", schedule);
        server.watcher.on("change", schedule);
        server.watcher.on("unlink", schedule);
      },
    },
  };
}

function isMarkdownInside(filePath, directory) {
  return filePath.toLowerCase().endsWith(".md") && isInside(filePath, directory);
}

function isInside(filePath, directory) {
  return (
    filePath === directory ||
    filePath.startsWith(directory + path.sep)
  );
}
