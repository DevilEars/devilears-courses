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

function levelClass(level: string): string {
  const key = level.trim().toLowerCase();
  if (key === "beginner") return "badge-beginner";
  if (key === "intermediate") return "badge-intermediate";
  if (key === "advanced") return "badge-advanced";
  return "";
}

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
      <h1>Read the lesson. Then practice.</h1>
      <p className="lede">
        Each course turns a freeCodeCamp YouTube video into standalone written
        lessons, with quizzes and exercises. You can learn the material without
        watching the video. The original video stays on YouTube as an optional
        “Watch this part” link, and is credited on every course and lesson page.
      </p>
      <div className="course-grid">
        {courses.map((course) => {
          const total = lessonCount(course);
          const complete = getCourseProgress(state, course.id).completedLessons
            .length;
          return (
            <article className="course-card-wrap" key={course.id}>
              <Link className="course-card" to={`/courses/${course.id}`}>
                <div className="course-card-media">
                  <img
                    src={course.thumbnailUrl}
                    alt=""
                    width={480}
                    height={360}
                  />
                  <div className="course-card-badges">
                    <span className={`badge ${levelClass(course.level)}`}>
                      {course.level}
                    </span>
                    <span className="badge">
                      {formatDuration(course.source.durationSeconds)}
                    </span>
                  </div>
                </div>
                <div className="course-card-body">
                  <h2>{course.title}</h2>
                  <p className="card-description">{course.description}</p>
                  <div className="chip-row">
                    <span className="chip">{total} lessons</span>
                    <span className="chip">{course.modules.length} modules</span>
                  </div>
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
