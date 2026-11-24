import { useEffect, useMemo, useRef } from "react";
import DOMPurify from "dompurify";
import {
  readingTimeMinutes,
  renderLessonMarkdown,
  wordCount,
  type TocItem,
} from "../lib/markdown";

const PURIFY_CONFIG = {
  ALLOWED_TAGS: [
    "h2",
    "h3",
    "h4",
    "p",
    "a",
    "ul",
    "ol",
    "li",
    "pre",
    "code",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "blockquote",
    "strong",
    "em",
    "br",
    "hr",
    "span",
  ],
  ALLOWED_ATTR: ["href", "id", "class", "title", "target", "rel"],
  ALLOW_DATA_ATTR: false,
};

type Props = {
  markdown: string;
};

export default function LessonBody({ markdown }: Props) {
  const articleRef = useRef<HTMLElement | null>(null);
  const rendered = useMemo(() => renderLessonMarkdown(markdown), [markdown]);
  const cleanHtml = useMemo(
    () => DOMPurify.sanitize(rendered.html, PURIFY_CONFIG as Parameters<typeof DOMPurify.sanitize>[1]),
    [rendered.html],
  );
  const minutes = readingTimeMinutes(markdown);
  const words = wordCount(markdown);

  useEffect(() => {
    const root = articleRef.current;
    if (!root) return;
    const mermaidBlocks = root.querySelectorAll("pre code.language-mermaid");
    if (mermaidBlocks.length === 0) return;
    mermaidBlocks.forEach((block) => {
      const pre = block.parentElement;
      if (!pre || pre.dataset.mermaidReady === "true") return;
      pre.dataset.mermaidReady = "true";
      pre.classList.add("mermaid-fallback");
      const caption = document.createElement("p");
      caption.className = "diagram-caption";
      caption.textContent = "Diagram (Mermaid source — shown as text to keep the app bundle lean)";
      pre.parentElement?.insertBefore(caption, pre);
    });
  }, [cleanHtml]);

  return (
    <div className="lesson-reading">
      <p className="lesson-meta">
        {minutes} min read · {words.toLocaleString()} words
      </p>
      {rendered.toc.length > 0 ? <LessonToc items={rendered.toc} /> : null}
      <article
        ref={articleRef}
        className="lesson-article"
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />
    </div>
  );
}

function LessonToc({ items }: { items: TocItem[] }) {
  return (
    <nav className="lesson-toc" aria-label="On this page">
      <details open>
        <summary>On this page</summary>
        <ol>
          {items.map((item) => (
            <li key={item.id} className={item.level === 3 ? "is-sub" : undefined}>
              <a href={`#${item.id}`}>{item.text}</a>
            </li>
          ))}
        </ol>
      </details>
    </nav>
  );
}
