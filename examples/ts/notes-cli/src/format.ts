export function pad(s: string, width = 12): string {
  return s.length >= width ? s : s + " ".repeat(width - s.length);
}

export function formatNote(title: string, body: string): string {
  return `${pad(title)} | ${body}`;
}
