import { useCallback, useEffect, useState } from "react";
import type { Course, CourseProgress, ProgressState } from "../types";

const STORAGE_KEY = "devilears-courses-progress";

function emptyProgress(): CourseProgress {
  return { completedLessons: [], quizScores: {} };
}

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ProgressState;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeProgress(state: ProgressState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getCourseProgress(
  state: ProgressState,
  courseId: string,
): CourseProgress {
  return state[courseId] ?? emptyProgress();
}

export function lessonCount(course: Course): number {
  return course.modules.reduce((sum, module) => sum + module.lessons.length, 0);
}

export function flattenLessons(course: Course) {
  return course.modules.flatMap((module) =>
    module.lessons.map((lesson) => ({ module, lesson })),
  );
}

export function useProgress() {
  const [state, setState] = useState<ProgressState>(() =>
    typeof localStorage === "undefined" ? {} : loadProgress(),
  );

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) {
        setState(loadProgress());
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = useCallback(
    (courseId: string, updater: (current: CourseProgress) => CourseProgress) => {
      setState((prev) => {
        const next = {
          ...prev,
          [courseId]: updater(getCourseProgress(prev, courseId)),
        };
        writeProgress(next);
        return next;
      });
    },
    [],
  );

  const markLessonComplete = useCallback(
    (courseId: string, lessonId: string) => {
      update(courseId, (current) => {
        if (current.completedLessons.includes(lessonId)) return current;
        return {
          ...current,
          completedLessons: [...current.completedLessons, lessonId],
        };
      });
    },
    [update],
  );

  const saveQuizScore = useCallback(
    (courseId: string, lessonId: string, correct: number, total: number) => {
      update(courseId, (current) => ({
        ...current,
        quizScores: {
          ...current.quizScores,
          [lessonId]: { correct, total },
        },
      }));
    },
    [update],
  );

  return { state, markLessonComplete, saveQuizScore };
}
