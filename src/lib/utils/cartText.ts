const DESCRIPTION_TAGS = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;

export function stripDescriptionTags(value: string): string {
  if (!value.includes('<')) return value;
  return value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(DESCRIPTION_TAGS, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function describeCartError(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
