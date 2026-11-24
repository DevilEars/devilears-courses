import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { Course, Lesson } from "../types";
import { extractToc, wordCount } from "./markdown";

const MIN_FULL_WORDS = 300;
const MIN_FULL_SECTIONS = 2;
const OUTLINE_PHRASE = "Outline only — full notes pending transcript";

const coursesDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../public/courses",
);

function loadIndex(): string[] {
  const raw = JSON.parse(
    readFileSync(join(coursesDir, "index.json"), "utf8"),
  ) as { courses: string[] };
  return raw.courses;
}

function loadCourse(id: string): Course {
  return JSON.parse(
    readFileSync(join(coursesDir, `${id}.json`), "utf8"),
  ) as Course;
}

function lessonsOf(course: Course): Lesson[] {
  return course.modules.flatMap((module) => module.lessons);
}

describe("course JSON", () => {
  const ids = loadIndex();

  it("lists at least one course and each id has a matching file", () => {
    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) {
      const course = loadCourse(id);
      expect(course.id).toBe(id);
    }
  });

  it("gives every lesson a start time earlier than its end time", () => {
    for (const id of ids) {
      const course = loadCourse(id);
      for (const lesson of lessonsOf(course)) {
        expect(
          lesson.startSeconds,
          `${id}/${lesson.id} startSeconds`,
        ).toBeLessThan(lesson.endSeconds);
        expect(lesson.startSeconds).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("keeps every quiz answer inside the choices range", () => {
    for (const id of ids) {
      const course = loadCourse(id);
      for (const lesson of lessonsOf(course)) {
        expect(lesson.quiz.length, `${id}/${lesson.id} quiz`).toBeGreaterThan(0);
        for (const [index, question] of lesson.quiz.entries()) {
          expect(
            question.choices.length,
            `${id}/${lesson.id} q${index} choices`,
          ).toBeGreaterThan(1);
          expect(question.correctIndex).toBeGreaterThanOrEqual(0);
          expect(question.correctIndex).toBeLessThan(question.choices.length);
        }
      }
    }
  });

  it("credits freeCodeCamp and links the original YouTube video", () => {
    for (const id of ids) {
      const course = loadCourse(id);
      const { source } = course;
      expect(source.name).toMatch(/freeCodeCamp/i);
      expect(source.channelUrl).toMatch(/^https:\/\/www\.youtube\.com\//);
      expect(source.creator.length).toBeGreaterThan(0);
      expect(source.videoId.length).toBeGreaterThan(0);
      expect(source.videoUrl).toContain(source.videoId);
      expect(source.videoUrl).toMatch(/^https:\/\/www\.youtube\.com\/watch\?v=/);
      expect(source.videoTitle.length).toBeGreaterThan(0);
      expect(source.durationSeconds).toBeGreaterThan(0);
    }
  });

  it("gives every lesson written content and a content status", () => {
    for (const id of ids) {
      const course = loadCourse(id);
      for (const lesson of lessonsOf(course)) {
        expect(typeof lesson.content, `${id}/${lesson.id} content`).toBe("string");
        expect(lesson.content.length, `${id}/${lesson.id} content`).toBeGreaterThan(0);
        expect(
          ["full", "outline-pending-transcript"],
          `${id}/${lesson.id} contentStatus`,
        ).toContain(lesson.contentStatus);
      }
    }
  });

  it("uses full written notes for transcript-based courses", () => {
    for (const id of ids) {
      const course = loadCourse(id);
      if (course.summarySource !== "transcript") continue;
      const lessons = lessonsOf(course);
      expect(lessons.length, id).toBeGreaterThan(0);
      for (const lesson of lessons) {
        expect(
          lesson.contentStatus,
          `${id}/${lesson.id} should be a full written lesson`,
        ).toBe("full");
        expect(
          lesson.content.includes(OUTLINE_PHRASE),
          `${id}/${lesson.id} should not be marked outline-only`,
        ).toBe(false);
        const words = wordCount(lesson.content);
        const sections = extractToc(lesson.content).filter((item) => item.level === 2);
        expect(words, `${id}/${lesson.id} word count`).toBeGreaterThanOrEqual(MIN_FULL_WORDS);
        expect(sections.length, `${id}/${lesson.id} ## sections`).toBeGreaterThanOrEqual(
          MIN_FULL_SECTIONS,
        );
      }
    }
  });

  it("marks courses without a transcript as outline only", () => {
    for (const id of ids) {
      const course = loadCourse(id);
      if (course.summarySource !== "chapters-and-description") continue;
      for (const lesson of lessonsOf(course)) {
        expect(lesson.contentStatus, `${id}/${lesson.id}`).toBe(
          "outline-pending-transcript",
        );
        expect(lesson.content, `${id}/${lesson.id}`).toContain(OUTLINE_PHRASE);
      }
    }
  });
});
