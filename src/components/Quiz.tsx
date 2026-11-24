import { useMemo, useState } from "react";
import type { QuizQuestion } from "../types";

type Props = {
  questions: QuizQuestion[];
  onScored: (correct: number, total: number) => void;
};

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default function Quiz({ questions, onScored }: Props) {
  const [answers, setAnswers] = useState<Array<number | null>>(
    () => questions.map(() => null),
  );

  const correctCount = useMemo(() => {
    return questions.reduce((sum, question, index) => {
      return answers[index] === question.correctIndex ? sum + 1 : sum;
    }, 0);
  }, [answers, questions]);

  const answeredCount = answers.filter((answer) => answer !== null).length;
  const completed = answeredCount === questions.length && questions.length > 0;
  const scorePercent =
    questions.length === 0
      ? 0
      : Math.round((correctCount / questions.length) * 100);

  function select(questionIndex: number, choiceIndex: number) {
    setAnswers((prev) => {
      if (prev[questionIndex] !== null) return prev;
      const next = [...prev];
      next[questionIndex] = choiceIndex;
      const finished = next.every((answer) => answer !== null);
      if (finished) {
        const score = questions.reduce((sum, question, index) => {
          return next[index] === question.correctIndex ? sum + 1 : sum;
        }, 0);
        onScored(score, questions.length);
      }
      return next;
    });
  }

  return (
    <section className="section-card quiz-card">
      <div className="quiz-header">
        <div>
          <h2>Quiz</h2>
          <p className="progress-label">
            Instant feedback after each answer. Your score is saved on this
            device.
          </p>
        </div>
        <div className="quiz-score" role="status">
          {completed ? (
            <>
              <strong>
                Score {correctCount}/{questions.length}
              </strong>
              <span className="quiz-score-percent">{scorePercent}%</span>
            </>
          ) : (
            <strong>
              {answeredCount}/{questions.length} answered
            </strong>
          )}
          <div
            className="quiz-score-track"
            aria-hidden="true"
          >
            <div
              className={`quiz-score-fill${completed ? " is-final" : ""}`}
              style={{
                width: `${
                  completed
                    ? scorePercent
                    : questions.length
                      ? Math.round((answeredCount / questions.length) * 100)
                      : 0
                }%`,
              }}
            />
          </div>
        </div>
      </div>
      <div className="quiz-list">
        {questions.map((question, questionIndex) => {
          const selected = answers[questionIndex];
          return (
            <div className="quiz-item" key={question.question}>
              <h3>
                <span className="quiz-item-number">
                  {questionIndex + 1}
                </span>
                {question.question}
              </h3>
              <div
                className="choice-list"
                role="group"
                aria-label={question.question}
              >
                {question.choices.map((choice, choiceIndex) => {
                  const isSelected = selected === choiceIndex;
                  const showResult = selected !== null;
                  const isCorrect = choiceIndex === question.correctIndex;
                  const className = [
                    "choice",
                    isSelected ? "selected" : "",
                    showResult && isCorrect ? "correct" : "",
                    showResult && isSelected && !isCorrect ? "incorrect" : "",
                  ]
                    .filter(Boolean)
                    .join(" ");
                  return (
                    <button
                      key={choice}
                      type="button"
                      className={className}
                      onClick={() => select(questionIndex, choiceIndex)}
                      disabled={selected !== null}
                      aria-pressed={isSelected}
                    >
                      <span className="choice-letter" aria-hidden="true">
                        {LETTERS[choiceIndex] ?? choiceIndex + 1}
                      </span>
                      <span className="choice-text">{choice}</span>
                    </button>
                  );
                })}
              </div>
              {selected !== null ? (
                <p
                  className={`feedback${
                    selected === question.correctIndex
                      ? " is-correct"
                      : " is-wrong"
                  }`}
                >
                  {selected === question.correctIndex
                    ? "Correct. "
                    : "Not quite. "}
                  {question.explanation}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
