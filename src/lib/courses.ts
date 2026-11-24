import type { Course } from "../types";

export async function loadCourseIds(): Promise<string[]> {
  const response = await fetch("/courses/index.json");
  if (!response.ok) {
    throw new Error("Could not load the course list.");
  }
  const data = (await response.json()) as { courses: string[] };
  return data.courses;
}

export async function loadCourse(id: string): Promise<Course> {
  const response = await fetch(`/courses/${id}.json`);
  if (!response.ok) {
    throw new Error("Course not found.");
  }
  return (await response.json()) as Course;
}

export async function loadAllCourses(): Promise<Course[]> {
  const ids = await loadCourseIds();
  return Promise.all(ids.map((id) => loadCourse(id)));
}

export function findLesson(course: Course, lessonId: string) {
  for (const module of course.modules) {
    const lesson = module.lessons.find((item) => item.id === lessonId);
    if (lesson) {
      return { module, lesson };
    }
  }
  return null;
}
