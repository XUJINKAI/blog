import { readFile } from "node:fs/promises";
import projects from "../home/projects.js";

const homeDirectory = new URL("../home/", import.meta.url);

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
  return readFile(new URL(file, homeDirectory), "utf8");
}
