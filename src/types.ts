export type Chapter = {
  title: string;
  startSeconds: number;
};

export type QuizQuestion = {
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
};

export type Exercise = {
  prompt: string;
  hint: string;
};

/** Whether the written lesson is complete or only a chapter outline. */
export type LessonContentStatus = "full" | "outline-pending-transcript";

export type Lesson = {
  id: string;
  title: string;
  startSeconds: number;
  endSeconds: number;
  chapters: Chapter[];
  /** Short abstract for course cards and previews. */
  summary: string;
  /**
   * Standalone written lesson in Markdown.
   * See CONTENT_FORMAT.md for the required shape and subset.
   */
  content: string;
  contentStatus: LessonContentStatus;
  quiz: QuizQuestion[];
  exercise: Exercise;
};

export type Module = {
  id: string;
  title: string;
  lessons: Lesson[];
};

export type CourseSource = {
  name: string;
  channelUrl: string;
  creator: string;
  videoTitle: string;
  videoId: string;
  videoUrl: string;
  duration: string;
  durationSeconds: number;
};

export type SummarySource = "chapters-and-description" | "transcript";

export type Course = {
  id: string;
  title: string;
  description: string;
  level: string;
  summarySource: SummarySource;
  source: CourseSource;
  thumbnailUrl: string;
  modules: Module[];
};

export type LessonQuizScore = {
  correct: number;
  total: number;
};

export type CourseProgress = {
  completedLessons: string[];
  quizScores: Record<string, LessonQuizScore>;
};

export type ProgressState = Record<string, CourseProgress>;
