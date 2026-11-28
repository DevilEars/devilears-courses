import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Credit from "../components/Credit";
import Exercise from "../components/Exercise";
import LessonBody from "../components/LessonBody";
import Quiz from "../components/Quiz";
import { findLesson, loadPublishedCourse } from "../lib/courses";
import { flattenLessons, useProgress } from "../lib/progress";
import { formatTimestamp, youtubeEmbedUrl, youtubeWatchUrl } from "../lib/time";
import type { Course } from "../types";

export default function LessonView() {
  const { courseId, lessonId } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { state, markLessonComplete, saveQuizScore } = useProgress();

  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;
    loadPublishedCourse(courseId)
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
  const watchUrl = youtubeWatchUrl(
    course.source.videoId,
    lesson.startSeconds,
  );
  const positionLabel =
    index >= 0 ? `Lesson ${index + 1} of ${sequence.length}` : "Lesson";
  const isOutline = lesson.contentStatus === "outline-pending-transcript";

  return (
    <div className="lesson-page is-reading">
      <header className="lesson-heading">
        <p className="page-kicker">
          {module.title} · {positionLabel}
        </p>
        <h1>{lesson.title}</h1>
        {isOutline ? (
          <div className="outline-banner" role="status">
            <strong>Outline only — full notes pending transcript</strong>
            <p>
              A complete written lesson will be added when the official
              transcript is available. The outline below is from public chapter
              titles and the video description, not a full lesson.
            </p>
          </div>
        ) : (
          <p className="lede">{lesson.summary}</p>
        )}
      </header>

      {lesson.content ? <LessonBody markdown={lesson.content} /> : null}

      <div className="actions reading-complete">
        <button
          type="button"
          className="btn btn-primary"
          disabled={completed}
          onClick={() => markLessonComplete(courseId, lesson.id)}
        >
          {completed ? "Lesson marked complete" : "Mark lesson complete"}
        </button>
      </div>

      <Quiz
        key={lesson.id}
        questions={lesson.quiz}
        onScored={(correct, total) =>
          saveQuizScore(courseId, lesson.id, correct, total)
        }
      />
      <Exercise exercise={lesson.exercise} />

      <details className="watch-optional">
        <summary>Watch this part (optional)</summary>
        <p className="progress-label">
          The original freeCodeCamp video is optional. This embed starts at{" "}
          {formatTimestamp(lesson.startSeconds)} and stops at{" "}
          {formatTimestamp(lesson.endSeconds)}. You can also{" "}
          <a href={watchUrl} target="_blank" rel="noreferrer">
            open this segment on YouTube
          </a>
          .
        </p>
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
        <Credit course={course} startSeconds={lesson.startSeconds} />
      </details>

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
          <Link className="lesson-nav-link is-next" to={`/courses/${courseId}`}>
            <span className="lesson-nav-dir">End of course</span>
            <span className="lesson-nav-title">Back to course</span>
          </Link>
        )}
      </nav>
    </div>
  );
}
