export const SEARCH_FOCUS_PARAM = 'focus';
export const SEARCH_FOCUS_VALUE = 'search';

export const SEARCH_FOCUS_ONLY_VALUE = 'true';

export const parseSearchQuery = (params: URLSearchParams): string | undefined => {
  const rawSearch = params.get('search')?.trim();
  if (!rawSearch || rawSearch === SEARCH_FOCUS_ONLY_VALUE) return undefined;
  return rawSearch;
};
