import { parse, render, transform } from 'ultrahtml';
import sanitize from 'ultrahtml/transformers/sanitize';

export async function sanitizeWordPressHtml(rawHtml: string): Promise<string> {
  if (!rawHtml || typeof rawHtml !== 'string') {
    return '';
  }

  return await transform(rawHtml, [
    sanitize({
      dropAttributes: {
        style: ['*'],
      },
    }),
  ]);
}

function flattenHeadingLevels(node: unknown): void {
  const element = node as { name?: string; children?: unknown[] };
  if (element.name === 'h1') element.name = 'h2';
  for (const child of element.children ?? []) flattenHeadingLevels(child);
}

export async function demoteEmbeddedHeadings(rawHtml: string): Promise<string> {
  if (!rawHtml || typeof rawHtml !== 'string' || !/<h1[\s>]/i.test(rawHtml)) {
    return rawHtml;
  }

  const document = parse(rawHtml);
  flattenHeadingLevels(document);
  return render(document);
}

const FIRST_HEADING_PATTERN = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/i;

function normalizeHeadingText(value: string): string {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .toLowerCase();
}

export function leadHeadingRepeatsSection(rawHtml: string, sectionTitle: string): boolean {
  const match = rawHtml.match(FIRST_HEADING_PATTERN);
  if (!match) return false;
  const leadText = normalizeHeadingText(match[2]);
  if (!leadText) return false;
  const sectionText = normalizeHeadingText(sectionTitle);
  return leadText === sectionText || leadText.includes(sectionText);
}
