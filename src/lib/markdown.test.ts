import { describe, expect, it } from "vitest";
import {
  extractToc,
  readingTimeMinutes,
  renderLessonMarkdown,
  slugify,
  wordCount,
} from "./markdown";

describe("lesson markdown", () => {
  it("builds unique heading ids for the table of contents", () => {
    const used = new Map<string, number>();
    expect(slugify("Key Takeaways", used)).toBe("key-takeaways");
    expect(slugify("Key takeaways", used)).toBe("key-takeaways-2");
  });

  it("counts words and estimates reading time from prose, not code fences", () => {
    const markdown = `## Intro

One two three four five.

\`\`\`js
const ignored = "this should not inflate the count too much because we strip fences";
\`\`\`
`;
    expect(wordCount(markdown)).toBe(6); // Intro + five words... "Intro" is in heading: "Intro One two three four five" = 6
    expect(readingTimeMinutes("word ".repeat(220))).toBe(1);
    expect(readingTimeMinutes("word ".repeat(440))).toBe(2);
  });

  it("renders headings, tables, and fenced code, and drops raw HTML", () => {
    const markdown = `## Hello world

<script>alert(1)</script>

A [safe](https://example.com) link and [bad](javascript:alert(1)) link.

\`\`\`js
console.log("hi");
\`\`\`

| Col |
| --- |
| Val |
`;
    const { html, toc } = renderLessonMarkdown(markdown);
    expect(toc).toEqual([{ level: 2, text: "Hello world", id: "hello-world" }]);
    expect(html).toContain('id="hello-world"');
    expect(html).toContain("<table>");
    expect(html).toContain("console.log");
    expect(html).not.toContain("<script>");
    expect(html).toContain('href="https://example.com"');
    expect(html).not.toContain("javascript:alert");
    expect(html).toContain("bad");
  });

  it("extracts h2 and h3 entries in order", () => {
    const toc = extractToc(`## Alpha

text

### Beta

## Gamma
`);
    expect(toc.map((item) => item.id)).toEqual(["alpha", "beta", "gamma"]);
    expect(toc[1].level).toBe(3);
  });
});
