import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { isPublishedCourse } from "../src/lib/published.ts";
import type { Course } from "../src/types.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = join(root, "dist");
const coursesDir = join(root, "public/courses");
const indexPath = join(distDir, "index.html");

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const indexHtml = readFileSync(indexPath, "utf8");
cpSync(indexPath, join(distDir, "404.html"));

const index = JSON.parse(
  readFileSync(join(coursesDir, "index.json"), "utf8"),
) as { courses: string[] };

mkdirSync(join(distDir, "courses"), { recursive: true });

for (const id of index.courses) {
  const course = JSON.parse(
    readFileSync(join(coursesDir, `${id}.json`), "utf8"),
  ) as Course;
  if (!isPublishedCourse(course)) {
    continue;
  }
  const title = escapeHtml(course.title);
  const html = indexHtml.replace(
    /<title>[^<]*<\/title>/,
    () => `<title>${title}</title>`,
  );
  writeFileSync(join(distDir, "courses", `${id}.html`), html);
}
