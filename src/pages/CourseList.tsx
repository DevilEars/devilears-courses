import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Credit from "../components/Credit";
import ProgressBar from "../components/ProgressBar";
import { loadAllCourses } from "../lib/courses";
import { formatDuration } from "../lib/time";
import {
  getCourseProgress,
  lessonCount,
  useProgress,
} from "../lib/progress";
import type { Course } from "../types";

export default function CourseList() {
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { state } = useProgress();

  useEffect(() => {
    let cancelled = false;
    loadAllCourses()
      .then((data) => {
        if (!cancelled) setCourses(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load courses.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="error">
        <h1>Could not load courses</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!courses) {
    return <p className="loading">Loading courses…</p>;
  }

  return (
    <div>
      <p className="page-kicker">Course library</p>
      <h1>Learn by watching, then practice.</h1>
      <p className="lede">
        Each course turns a freeCodeCamp YouTube video into modules, lessons,
        short quizzes, and exercises. The original video is embedded from
        YouTube and credited on every page.
      </p>
      <div className="course-grid">
        {courses.map((course) => {
          const total = lessonCount(course);
          const complete = getCourseProgress(state, course.id).completedLessons
            .length;
          return (
            <article key={course.id}>
              <Link className="course-card" to={`/courses/${course.id}`}>
                <img
                  src={course.thumbnailUrl}
                  alt=""
                  width={480}
                  height={360}
                />
                <div className="course-card-body">
                  <div className="chip-row">
                    <span className="chip">{course.level}</span>
                    <span className="chip">
                      {formatDuration(course.source.durationSeconds)}
                    </span>
                    <span className="chip">{total} lessons</span>
                  </div>
                  <h2>{course.title}</h2>
                  <p className="lede" style={{ marginBottom: "0.85rem" }}>
                    {course.description}
                  </p>
                  <ProgressBar complete={complete} total={total} />
                </div>
              </Link>
              <Credit course={course} />
            </article>
          );
        })}
      </div>
    </div>
  );
}
