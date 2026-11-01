import { transform } from 'ultrahtml';
import sanitize from 'ultrahtml/transformers/sanitize';

/**
 * Strips conflicting TinyMCE inline styles (like font-size: 120%)
 * while preserving semantic structure, tags, and responsive image attributes (srcset, sizes, loading)
 */
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
