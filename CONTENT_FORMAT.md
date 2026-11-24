# Lesson content format

Each lesson is a **standalone written lesson**. A reader should be able to learn everything taught in that video segment without watching the video. The original freeCodeCamp video is an optional “Watch this part” link and embed, and must stay credited.

## JSON fields

Every object in `modules[].lessons[]` includes the existing fields (`id`, `title`, `startSeconds`, `endSeconds`, `chapters`, `summary`, `quiz`, `exercise`) plus:

| Field | Type | Meaning |
| --- | --- | --- |
| `content` | string | The full lesson body, written in Markdown. |
| `contentStatus` | `"full"` or `"outline-pending-transcript"` | `full` when notes were written from an official transcript. `outline-pending-transcript` when no transcript is available yet. |

`summary` stays a short abstract (one or two sentences) for course lists and the lesson intro. Do not put the whole lesson there.

`summarySource` on the course remains `"transcript"` or `"chapters-and-description"`. Transcript-based courses must use `contentStatus: "full"` on every lesson. Courses still waiting on a transcript must use `contentStatus: "outline-pending-transcript"` on every lesson.

## Markdown subset

Write `content` in this subset so the built-in renderer can sanitize and display it safely:

- Headings: `##` and `###` only (do not use `#` — the lesson title is already the page heading)
- Paragraphs, emphasis (`*italic*`, `**bold**`), inline `code`
- Bullet and numbered lists
- Tables
- Block quotes — short quotations only (a sentence or two). Do not paste long verbatim transcript passages
- Fenced code blocks with a language tag (`js`, `ts`, `json`, `bash`, `text`)
- Optional `mermaid` fences for diagrams; the app may show the source as text if the Mermaid library is not loaded
- Links must be `https:`, `http:`, `mailto:`, or in-page `#` anchors

Do not use raw HTML, images, or scripts in `content`.

## Required shape for `full` lessons

Write in your own words as structured notes, covering every concept, definition, and example the instructor teaches in that segment.

1. **Introduction** — set the scene in a short opening section (`##` heading).
2. **Explanation sections** — as many `##` / `###` sections as the material needs. Include definitions, worked examples, and the real-world cases the instructor mentions.
3. **Code or diagrams**
   - JavaScript: runnable snippets and the expected output (for example a `// → 3` comment or a short “Expected output” line). Recreate examples rather than copying an instructor file verbatim where that is reasonable.
   - System design: trade-off tables, ASCII or Mermaid diagrams where they help, and named real-world examples from the lesson.
4. **Common pitfalls** — mistakes the instructor warns about, or the usual traps for this topic.
5. **Key takeaways** — a short bullet list the reader can scan.

Quizzes and exercises must test the written content, not “did you watch the clip?”.

A `full` lesson should be non-trivial: at least **300 words** of prose and at least **two `##` sections**. Short video segments can still meet that bar by spelling out every idea that was taught, without inventing topics that were not in the segment.

## Outline-only lessons

If there is no transcript yet, set `contentStatus` to `"outline-pending-transcript"`. The Markdown **must** include the exact sentence:

`Outline only — full notes pending transcript`

Keep the outline faithful to public chapter titles and the official description. Do not invent a detailed lesson.

## Adding or updating a lesson

1. Follow this file when writing or revising `content`.
2. Keep `startSeconds` / `endSeconds` in sync with the optional YouTube embed.
3. Run `npm test` — it checks that transcript-based lessons are complete and that outline-only lessons are clearly marked.
