const ENTRY_START = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/;
const LEVEL = /^\S+\s+(ERROR|WARN)\s/;
const COLORS: Record<string, string> = { ERROR: 'red', WARN: 'orange' };

/**
 * The entries of a log: a line that starts with a timestamp, together with the lines after it that don't (an Exchange
 * body, a stack trace). Lines before the first timestamp make an entry of their own.
 */
export function logEntries(log: string): string[] {
  const entries: string[] = [];
  for (const line of log.split(/\r?\n/)) {
    if (entries.length === 0 || ENTRY_START.test(line)) {
      entries.push(line);
    } else {
      entries[entries.length - 1] += `\n${line}`;
    }
  }
  return entries;
}

/** The entries that contain the search text, escaped as HTML, ERROR entries in red and WARN entries in orange. */
export function colorLog(entries: string[], search: string): string {
  const query = search.toLocaleLowerCase();
  return entries
    .filter(entry => !query || entry.toLocaleLowerCase().includes(query))
    .map(entry => {
      const escaped = escapeHtml(entry);
      const color = COLORS[LEVEL.exec(entry)?.[1] ?? ''];
      return color ? `<span style="color: ${color}">${escaped}</span>` : escaped;
    })
    .join('\n');
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
