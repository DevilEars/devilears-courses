import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { Course, Lesson } from "../types";
import { isPublishedCourse } from "./published";

const coursesDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../public/courses",
);

function lesson(contentStatus: Lesson["contentStatus"]): Lesson {
  return {
    id: "lesson",
    title: "Lesson",
    startSeconds: 0,
    endSeconds: 1,
    chapters: [],
    summary: "",
    content: "",
    contentStatus,
    quiz: [],
    exercise: { prompt: "", hint: "" },
  };
}

function course(lessons: Lesson[]): Course {
  return {
    id: "course",
    title: "Course",
    description: "",
    level: "beginner",
    summarySource: "transcript",
    source: {
      name: "",
      channelUrl: "",
      creator: "",
      videoTitle: "",
      videoId: "",
      videoUrl: "",
      duration: "",
      durationSeconds: 0,
    },
    thumbnailUrl: "",
    modules: [{ id: "module", title: "Module", lessons }],
  };
}

describe("isPublishedCourse", () => {
  it("is true only when every lesson has contentStatus full", () => {
    expect(isPublishedCourse(course([lesson("full")]))).toBe(true);
    expect(isPublishedCourse(course([lesson("full"), lesson("full")]))).toBe(
      true,
    );
    expect(
      isPublishedCourse(
        course([lesson("full"), lesson("outline-pending-transcript")]),
      ),
    ).toBe(false);
    expect(
      isPublishedCourse(course([lesson("outline-pending-transcript")])),
    ).toBe(false);

    const index = JSON.parse(
      readFileSync(join(coursesDir, "index.json"), "utf8"),
    ) as { courses: string[] };
    const published: string[] = [];
    const hidden: string[] = [];
    for (const id of index.courses) {
      const data = JSON.parse(
        readFileSync(join(coursesDir, `${id}.json`), "utf8"),
      ) as Course;
      if (isPublishedCourse(data)) {
        published.push(id);
      } else {
        hidden.push(id);
      }
    }
    expect(published).toEqual([
      "learn-javascript-beginners",
      "system-design-concepts",
      "system-design-apis-infra",
    ]);
    expect(hidden).toEqual([
      "system-design-senior-engineer",
      "become-great-engineering-manager",
    ]);
  });
});
