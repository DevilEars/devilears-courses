type Props = {
  complete: number;
  total: number;
  label?: string;
};

export default function ProgressBar({ complete, total, label }: Props) {
  const percent = total === 0 ? 0 : Math.round((complete / total) * 100);
  return (
    <div>
      <div
        className="progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={label ?? "Course progress"}
      >
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
      <p className="progress-label">
        {complete} of {total} lessons complete ({percent}%)
      </p>
    </div>
  );
}
