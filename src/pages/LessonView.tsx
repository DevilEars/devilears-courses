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

  return (
    <div>
      <p className="page-kicker">
        {module.title} · {formatTimestamp(lesson.startSeconds)}–
        {formatTimestamp(lesson.endSeconds)}
      </p>
      <h1>{lesson.title}</h1>
      <p className="lede">
        The player starts at this lesson’s timestamp in the original freeCodeCamp
        video and stops at the next lesson.
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
      <section className="section-card">
        <h2>In this lesson</h2>
        <ul className="chapter-list">
          {lesson.chapters.map((chapter) => (
            <li className="chip" key={`${chapter.startSeconds}-${chapter.title}`}>
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
      <nav className="footer-nav" aria-label="Lesson">
        {previous ? (
          <Link
            className="btn btn-secondary"
            to={`/courses/${courseId}/lessons/${previous.lesson.id}`}
          >
            Previous
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            className="btn btn-secondary"
            to={`/courses/${courseId}/lessons/${next.lesson.id}`}
          >
            Next lesson
          </Link>
        ) : (
          <Link className="btn btn-secondary" to={`/courses/${courseId}`}>
            Back to course
          </Link>
        )}
      </nav>
    </div>
  );
}
