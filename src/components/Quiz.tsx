import { useMemo, useState } from "react";
import type { QuizQuestion } from "../types";

type Props = {
  questions: QuizQuestion[];
  onScored: (correct: number, total: number) => void;
};

export default function Quiz({ questions, onScored }: Props) {
  const [answers, setAnswers] = useState<Array<number | null>>(
    () => questions.map(() => null),
  );

  const correctCount = useMemo(() => {
    return questions.reduce((sum, question, index) => {
      return answers[index] === question.correctIndex ? sum + 1 : sum;
    }, 0);
  }, [answers, questions]);

  const completed = answers.every((answer) => answer !== null);

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
    <section className="section-card">
      <h2>Quiz</h2>
      <p className="progress-label">
        Instant feedback after each answer. Your score is saved on this device.
      </p>
      <div className="quiz-list">
        {questions.map((question, questionIndex) => {
          const selected = answers[questionIndex];
          return (
            <div key={question.question}>
              <h3>
                {questionIndex + 1}. {question.question}
              </h3>
              <div className="choice-list" role="group" aria-label={question.question}>
                {question.choices.map((choice, choiceIndex) => {
                  const isSelected = selected === choiceIndex;
                  const showResult = selected !== null;
                  const isCorrect = choiceIndex === question.correctIndex;
                  const className = [
                    "choice",
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
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>
              {selected !== null ? (
                <p className="feedback">
                  {selected === question.correctIndex ? "Correct. " : "Not quite. "}
                  {question.explanation}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
      {completed ? (
        <p className="feedback">
          <strong>
            Score: {correctCount} / {questions.length}
          </strong>
        </p>
      ) : null}
    </section>
  );
}
