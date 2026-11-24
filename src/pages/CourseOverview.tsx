import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Credit from "../components/Credit";
import ProgressBar from "../components/ProgressBar";
import { loadCourse } from "../lib/courses";
import { formatTimestamp } from "../lib/time";
import {
  flattenLessons,
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
  const completed = progress.completedLessons.length;
  const sequence = flattenLessons(course);
  const continueFrom =
    sequence.find(
      (item) => !progress.completedLessons.includes(item.lesson.id),
    ) ?? (completed === 0 ? sequence[0] : null);
  let lessonNumber = 0;

  return (
    <div>
      <div className="course-hero">
        <div className="course-hero-media">
          <img
            src={course.thumbnailUrl}
            alt=""
            width={480}
            height={360}
          />
        </div>
        <div className="course-hero-body">
          <p className="page-kicker">Course overview</p>
          <h1>{course.title}</h1>
          <p className="lede">{course.description}</p>
          <div className="chip-row">
            <span className={`badge ${levelClass(course.level)}`}>
              {course.level}
            </span>
            <span className="chip">{course.modules.length} modules</span>
            <span className="chip">{total} lessons</span>
            <span className="chip">{course.source.duration}</span>
          </div>
          <div className="hero-progress">
            <ProgressBar complete={completed} total={total} />
          </div>
          {continueFrom ? (
            <div className="actions">
              <Link
                className="btn btn-primary"
                to={`/courses/${course.id}/lessons/${continueFrom.lesson.id}`}
              >
                {completed === 0 ? "Start course" : "Continue learning"}
              </Link>
            </div>
          ) : (
            <p className="progress-label">You have completed every lesson.</p>
          )}
          <Credit course={course} />
        </div>
      </div>
      <div className="module-list">
        {course.modules.map((module, moduleIndex) => {
          const doneInModule = module.lessons.filter((lesson) =>
            progress.completedLessons.includes(lesson.id),
          ).length;
          const openByDefault =
            doneInModule < module.lessons.length || moduleIndex === 0;
          return (
            <details
              className="module"
              key={module.id}
              open={openByDefault}
            >
              <summary>
                <span className="module-summary-text">
                  <h2>{module.title}</h2>
                  <span className="progress-label">
                    {doneInModule} of {module.lessons.length} lessons complete
                  </span>
                </span>
              </summary>
              <ol>
                {module.lessons.map((lesson) => {
                  lessonNumber += 1;
                  const done = progress.completedLessons.includes(lesson.id);
                  const score = progress.quizScores[lesson.id];
                  const outline = lesson.contentStatus === "outline-pending-transcript";
                  return (
                    <li key={lesson.id}>
                      <Link
                        className={`lesson-link${done ? " is-complete" : ""}`}
                        to={`/courses/${course.id}/lessons/${lesson.id}`}
                      >
                        <span
                          className={`lesson-index${done ? " done" : ""}`}
                          aria-hidden="true"
                        >
                          {done ? "✓" : lessonNumber}
                        </span>
                        <span>
                          <strong>{lesson.title}</strong>
                          <br />
                          <small>
                            {done ? "Completed · " : ""}
                            {outline ? "Outline only — notes pending · " : "Written lesson · "}
                            {formatTimestamp(lesson.startSeconds)}
                          </small>
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
            </details>
          );
        })}
      </div>
    </div>
  );
}
