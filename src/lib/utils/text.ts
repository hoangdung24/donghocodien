export function cleanTitle(title: string): string {
  return title
    .replace(/&#8216;/g, '‘')
    .replace(/&#8217;/g, '’')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#8211;/g, '–')
    .replace(/&#038;/g, '&')
    .replace(/&/g, '&');
}
