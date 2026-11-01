import { transform } from 'ultrahtml';
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
