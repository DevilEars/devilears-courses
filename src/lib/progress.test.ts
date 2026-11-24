import { afterEach, describe, expect, it } from "vitest";
import type { Course, ProgressState } from "../types";
import {
  flattenLessons,
  getCourseProgress,
  lessonCount,
  loadProgress,
} from "./progress";

const STORAGE_KEY = "devilears-courses-progress";

function mockLocalStorage(initial?: Record<string, string>) {
  const store = new Map<string, string>(Object.entries(initial ?? {}));
  const localStorage = {
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
    removeItem(key: string) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
  Object.defineProperty(globalThis, "localStorage", {
    value: localStorage,
    configurable: true,
  });
  return store;
}

afterEach(() => {
  Reflect.deleteProperty(globalThis, "localStorage");
});

const sampleCourse: Course = {
  id: "sample",
  title: "Sample",
  description: "A tiny fixture",
  level: "Beginner",
  summarySource: "chapters-and-description",
  source: {
    name: "freeCodeCamp.org",
    channelUrl: "https://www.youtube.com/@freecodecamp",
    creator: "Test",
    videoTitle: "Sample",
    videoId: "abcdefghijk",
    videoUrl: "https://www.youtube.com/watch?v=abcdefghijk",
    duration: "1:00",
    durationSeconds: 60,
  },
  thumbnailUrl: "https://example.com/thumb.jpg",
  modules: [
    {
      id: "mod-a",
      title: "A",
      lessons: [
        {
          id: "l1",
          title: "One",
          startSeconds: 0,
          endSeconds: 10,
          chapters: [],
          summary: "First",
          content: "## Intro\n\nPlaceholder notes for tests.",
          contentStatus: "full",
          quiz: [],
          exercise: { prompt: "Try it", hint: "" },
        },
        {
          id: "l2",
          title: "Two",
          startSeconds: 10,
          endSeconds: 20,
          chapters: [],
          summary: "Second",
          content: "## Intro\n\nPlaceholder notes for tests.",
          contentStatus: "full",
          quiz: [],
          exercise: { prompt: "Try it", hint: "" },
        },
      ],
    },
    {
      id: "mod-b",
      title: "B",
      lessons: [
        {
          id: "l3",
          title: "Three",
          startSeconds: 20,
          endSeconds: 30,
          chapters: [],
          summary: "Third",
          content: "## Intro\n\nPlaceholder notes for tests.",
          contentStatus: "full",
          quiz: [],
          exercise: { prompt: "Try it", hint: "" },
        },
      ],
    },
  ],
};

describe("loadProgress", () => {
  it("returns an empty object when nothing is stored", () => {
    mockLocalStorage();
    expect(loadProgress()).toEqual({});
  });

  it("parses a saved progress blob from localStorage", () => {
    const saved: ProgressState = {
      sample: {
        completedLessons: ["l1"],
        quizScores: { l1: { correct: 2, total: 3 } },
      },
    };
    mockLocalStorage({ [STORAGE_KEY]: JSON.stringify(saved) });
    expect(loadProgress()).toEqual(saved);
  });

  it("returns an empty object for invalid JSON or a non-object value", () => {
    mockLocalStorage({ [STORAGE_KEY]: "not-json" });
    expect(loadProgress()).toEqual({});

    mockLocalStorage({ [STORAGE_KEY]: "null" });
    expect(loadProgress()).toEqual({});

    mockLocalStorage({ [STORAGE_KEY]: '"a-string"' });
    expect(loadProgress()).toEqual({});
  });
});

describe("progress helpers", () => {
  it("returns empty course progress for an unknown course", () => {
    expect(getCourseProgress({}, "missing")).toEqual({
      completedLessons: [],
      quizScores: {},
    });
  });

  it("counts and flattens lessons across modules", () => {
    expect(lessonCount(sampleCourse)).toBe(3);
    expect(flattenLessons(sampleCourse).map(({ lesson }) => lesson.id)).toEqual(
      ["l1", "l2", "l3"],
    );
  });
});
