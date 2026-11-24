import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Credit from "../components/Credit";
import ProgressBar from "../components/ProgressBar";
import { loadCourse } from "../lib/courses";
import { formatTimestamp } from "../lib/time";
import {
  getCourseProgress,
  lessonCount,
  useProgress,
} from "../lib/progress";
import type { Course } from "../types";

export default function CourseOverview() {
  const { courseId } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { state } = useProgress();

  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;
    loadCourse(courseId)
      .then((data) => {
        if (!cancelled) setCourse(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Course not found.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  if (error) {
    return (
      <div className="error">
        <h1>Course not found</h1>
        <p>{error}</p>
        <p>
          <Link to="/">Back to all courses</Link>
        </p>
      </div>
    );
  }

  if (!course || !courseId) {
    return <p className="loading">Loading course…</p>;
  }

  const progress = getCourseProgress(state, courseId);
  const total = lessonCount(course);
  let lessonNumber = 0;

  return (
    <div>
      <p className="page-kicker">{course.level}</p>
      <h1>{course.title}</h1>
      <p className="lede">{course.description}</p>
      <div className="chip-row">
        <span className="chip">{course.modules.length} modules</span>
        <span className="chip">{total} lessons</span>
        <span className="chip">{course.source.duration}</span>
      </div>
      <div style={{ margin: "1rem 0" }}>
        <ProgressBar complete={progress.completedLessons.length} total={total} />
      </div>
      <Credit course={course} />
      <div className="module-list">
        {course.modules.map((module) => (
          <section className="module" key={module.id}>
            <header>
              <h2>{module.title}</h2>
              <span className="progress-label">
                {module.lessons.length} lessons
              </span>
            </header>
            <ol>
              {module.lessons.map((lesson) => {
                lessonNumber += 1;
                const done = progress.completedLessons.includes(lesson.id);
                const score = progress.quizScores[lesson.id];
                return (
                  <li key={lesson.id}>
                    <Link
                      className="lesson-link"
                      to={`/courses/${course.id}/lessons/${lesson.id}`}
                    >
                      <span className={`lesson-index${done ? " done" : ""}`}>
                        {done ? "✓" : lessonNumber}
                      </span>
                      <span>
                        <strong>{lesson.title}</strong>
                        <br />
                        <small>{formatTimestamp(lesson.startSeconds)}</small>
                      </span>
                      {score ? (
                        <span className="status-pill">
                          Quiz {score.correct}/{score.total}
                        </span>
                      ) : (
                        <span className="progress-label">Open</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
