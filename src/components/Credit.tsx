import { youtubeWatchUrl } from "../lib/time";
import type { Course } from "../types";

type Props = {
  course: Course;
  startSeconds?: number;
};

export default function Credit({ course, startSeconds = 0 }: Props) {
  const href = youtubeWatchUrl(course.source.videoId, startSeconds);
  const context =
    startSeconds > 0
      ? "Watch this lesson on the original YouTube video"
      : "Watch the original course on YouTube";

  return (
    <aside className="credit">
      <p>
        This content is based on{" "}
        <a href={href} target="_blank" rel="noreferrer">
          {course.source.videoTitle}
        </a>
        , created by {course.source.creator} and published by{" "}
        <a
          href={course.source.channelUrl}
          target="_blank"
          rel="noreferrer"
        >
          {course.source.name}
        </a>
        . {context}. The video is embedded from YouTube and is not re-hosted
        here.
      </p>
    </aside>
  );
}
