import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export async function readMarkdownFile(filePath) {
  const source = await readFile(filePath, "utf8");
  const parsed = matter(source);

  return {
    data: parsed.data ?? {},
    body: parsed.content ?? "",
  };
}

export async function listMarkdownFiles(rootDirectory) {
  const files = [];
  await walk(rootDirectory, files);
  return files.sort();
}

async function walk(directory, files) {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      await walk(fullPath, files);
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      files.push(fullPath);
    }
  }
}
