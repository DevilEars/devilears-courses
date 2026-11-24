import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Credit from "../components/Credit";
import Exercise from "../components/Exercise";
import Quiz from "../components/Quiz";
import { findLesson, loadCourse } from "../lib/courses";
import { flattenLessons, useProgress } from "../lib/progress";
import { formatTimestamp, youtubeEmbedUrl } from "../lib/time";
import type { Course } from "../types";

export default function LessonView() {
  const { courseId, lessonId } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { state, markLessonComplete, saveQuizScore } = useProgress();

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

  const located = course && lessonId ? findLesson(course, lessonId) : null;
  const sequence = useMemo(
    () => (course ? flattenLessons(course) : []),
    [course],
  );
  const index = sequence.findIndex((item) => item.lesson.id === lessonId);
  const previous = index > 0 ? sequence[index - 1] : null;
  const next =
    index >= 0 && index < sequence.length - 1 ? sequence[index + 1] : null;

  if (error) {
    return (
      <div className="error">
        <h1>Could not load lesson</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!course || !courseId || !lessonId) {
    return <p className="loading">Loading lesson…</p>;
  }

  if (!located) {
    return (
      <div className="error">
        <h1>Lesson not found</h1>
        <p>
          <Link to={`/courses/${courseId}`}>Back to the course</Link>
        </p>
      </div>
    );
  }

  const { module, lesson } = located;
  const completed = Boolean(
    state[courseId]?.completedLessons.includes(lesson.id),
  );
  const embed = youtubeEmbedUrl(
    course.source.videoId,
    lesson.startSeconds,
    lesson.endSeconds,
  );
  const positionLabel =
    index >= 0 ? `Lesson ${index + 1} of ${sequence.length}` : "Lesson";

  return (
    <div className="lesson-page">
      <header className="lesson-heading">
        <p className="page-kicker">
          {module.title} · {positionLabel} · {formatTimestamp(lesson.startSeconds)}
          –{formatTimestamp(lesson.endSeconds)}
        </p>
        <h1>{lesson.title}</h1>
        <p className="lede">
          The player starts at this lesson’s timestamp in the original
          freeCodeCamp video and stops at the next lesson.
        </p>
      </header>
      <div className="lesson-layout">
        <div className="lesson-media">
          <div className="player-dock">
            <div className="player-wrap">
              <iframe
                key={embed}
                src={embed}
                title={`${lesson.title} — ${course.source.videoTitle}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>
          <Credit course={course} startSeconds={lesson.startSeconds} />
        </div>
        <div className="lesson-content">
          <section className="section-card">
            <h2>In this lesson</h2>
            <ul className="chapter-list">
              {lesson.chapters.map((chapter) => (
                <li
                  className="chip"
                  key={`${chapter.startSeconds}-${chapter.title}`}
                >
                  {formatTimestamp(chapter.startSeconds)} {chapter.title}
                </li>
              ))}
            </ul>
            <p className="summary-text">{lesson.summary}</p>
            <p className="progress-label">
              {course.summarySource === "transcript"
                ? "Summary written from the official video transcript."
                : "Summary written from the public chapter titles and video description, not from a transcript."}
            </p>
          </section>
          <Quiz
            key={lesson.id}
            questions={lesson.quiz}
            onScored={(correct, total) =>
              saveQuizScore(courseId, lesson.id, correct, total)
            }
          />
          <Exercise exercise={lesson.exercise} />
          <div className="actions">
            <button
              type="button"
              className="btn btn-primary"
              disabled={completed}
              onClick={() => markLessonComplete(courseId, lesson.id)}
            >
              {completed ? "Lesson marked complete" : "Mark lesson complete"}
            </button>
          </div>
          <nav className="lesson-nav" aria-label="Lesson">
            {previous ? (
              <Link
                className="lesson-nav-link"
                to={`/courses/${courseId}/lessons/${previous.lesson.id}`}
              >
                <span className="lesson-nav-dir">Previous</span>
                <span className="lesson-nav-title">{previous.lesson.title}</span>
              </Link>
            ) : (
              <span className="lesson-nav-placeholder" />
            )}
            {next ? (
              <Link
                className="lesson-nav-link is-next"
                to={`/courses/${courseId}/lessons/${next.lesson.id}`}
              >
                <span className="lesson-nav-dir">Next lesson</span>
                <span className="lesson-nav-title">{next.lesson.title}</span>
              </Link>
            ) : (
              <Link
                className="lesson-nav-link is-next"
                to={`/courses/${courseId}`}
              >
                <span className="lesson-nav-dir">End of course</span>
                <span className="lesson-nav-title">Back to course</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}
