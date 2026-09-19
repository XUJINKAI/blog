import { readFile } from "node:fs/promises";
import path from "node:path";
import projects from "../home/projects.js";

const homeDirectory = path.join(process.cwd(), "src", "home");

export async function getHomeProjects() {
  return Promise.all(
    projects.map(async (project) => ({
      ...project,
      content: await readHomeFile(project.file),
    })),
  );
}

export function getHomeSection(file) {
  return readHomeFile(file);
}

function readHomeFile(file) {
  return readFile(path.join(homeDirectory, file), "utf8");
}
