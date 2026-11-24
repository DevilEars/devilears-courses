import { useState } from "react";
import type { Exercise as ExerciseType } from "../types";

type Props = {
  exercise: ExerciseType;
};

export default function Exercise({ exercise }: Props) {
  const [showHint, setShowHint] = useState(false);

  return (
    <section className="section-card">
      <h2>Exercise</h2>
      <p className="summary-text">{exercise.prompt}</p>
      <div className="actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setShowHint((value) => !value)}
        >
          {showHint ? "Hide hint" : "Show hint"}
        </button>
      </div>
      {showHint ? <p className="hint">{exercise.hint}</p> : null}
    </section>
  );
}
