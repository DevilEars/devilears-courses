import { marked, type Tokens } from "marked";

export type TocItem = {
  level: 2 | 3;
  text: string;
  id: string;
};

export const WORDS_PER_MINUTE = 220;

const ALLOWED_PROTOCOL = /^(https?:|mailto:|#)/i;

export function slugify(text: string, used?: Map<string, number>): string {
  const base =
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section";
  if (!used) return base;
  const count = used.get(base) ?? 0;
  used.set(base, count + 1);
  return count === 0 ? base : `${base}-${count + 1}`;
}

export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~>|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function wordCount(markdown: string): number {
  const text = stripMarkdown(markdown);
  if (!text) return 0;
  return text.split(/\s+/).length;
}

export function readingTimeMinutes(markdown: string): number {
  const words = wordCount(markdown);
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function extractToc(markdown: string): TocItem[] {
  const used = new Map<string, number>();
  const items: TocItem[] = [];
  for (const line of markdown.split(/\r?\n/)) {
    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!match) continue;
    const level = match[1].length === 2 ? 2 : 3;
    const text = match[2].replace(/[*_`]/g, "").trim();
    items.push({ level, text, id: slugify(text, used) });
  }
  return items;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderLessonMarkdown(markdown: string): {
  html: string;
  toc: TocItem[];
} {
  const toc = extractToc(markdown);
  const used = new Map<string, number>();
  const renderer = new marked.Renderer();

  renderer.html = () => "";

  renderer.code = ({ text, lang }: Tokens.Code) => {
    const language = (lang ?? "").trim();
    const cls = language ? ` class="language-${escapeHtml(language)}"` : "";
    return `<pre><code${cls}>${escapeHtml(text)}</code></pre>\n`;
  };

  renderer.link = function ({ href, title, tokens }: Tokens.Link) {
    const inner = this.parser.parseInline(tokens);
    const url = href?.trim() ?? "";
    if (!ALLOWED_PROTOCOL.test(url)) {
      return inner;
    }
    const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
    const external = /^https?:/i.test(url)
      ? ' target="_blank" rel="noreferrer noopener"'
      : "";
    return `<a href="${escapeHtml(url)}"${titleAttr}${external}>${inner}</a>`;
  };

  renderer.heading = function ({ tokens, depth }: Tokens.Heading) {
    const inner = this.parser.parseInline(tokens);
    const plain = inner.replace(/<[^>]+>/g, "").trim();
    const level = depth < 2 ? 2 : depth > 4 ? 4 : depth;
    const id = level === 2 || level === 3 ? slugify(plain, used) : "";
    if (id) {
      return `<h${level} id="${escapeHtml(id)}">${inner}</h${level}>\n`;
    }
    return `<h${level}>${inner}</h${level}>\n`;
  };

  const html = marked.parse(markdown, {
    renderer,
    gfm: true,
    breaks: false,
    async: false,
  }) as string;

  return { html, toc };
}
