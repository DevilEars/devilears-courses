import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { Course, Lesson } from "../types";

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
});
