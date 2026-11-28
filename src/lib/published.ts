import type { Course } from "../types";

/** A course is published only when every lesson is a full written lesson. */
export function isPublishedCourse(course: Course): boolean {
  return course.modules.every((module) =>
    module.lessons.every((lesson) => lesson.contentStatus === "full"),
  );
}
