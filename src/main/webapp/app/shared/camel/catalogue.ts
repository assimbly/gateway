/**
 * Reading the Camel catalogue for the step picker (ADR 0002): everything shown comes from the catalogue itself,
 * with no hand-maintained categories or lists.
 */

/** The parts of a catalogue component the picker uses. */
export interface CatalogueEntry {
  name: string;
  title?: string;
  description?: string;
  /** Comma-separated categories, such as `file,core`. */
  label?: string;
  consumerOnly?: boolean;
  producerOnly?: boolean;
}

/** Which side of an Endpoint a Step plays: a Source receives messages (consumer), Actions and Sinks send them (producer). */
export type EndpointRole = 'consumer' | 'producer';

export interface CategoryChip {
  label: string;
  count: number;
}

export function labelsOf(entry: CatalogueEntry): string[] {
  return (entry.label ?? '')
    .split(',')
    .map(label => label.trim())
    .filter(label => label.length > 0);
}

/** One chip per catalogue label, largest first; a component with several labels counts under each. */
export function categoryChips(entries: CatalogueEntry[], shownCount: number): { shown: CategoryChip[]; more: CategoryChip[] } {
  const counts = new Map<string, number>();
  entries.forEach(entry => labelsOf(entry).forEach(label => counts.set(label, (counts.get(label) ?? 0) + 1)));
  const chips = [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  return { shown: chips.slice(0, shownCount), more: chips.slice(shownCount) };
}

/** Why a component can't play this role, or null when it can. */
export function roleMismatch(entry: CatalogueEntry, role: EndpointRole): string | null {
  const name = entry.title ?? entry.name;
  if (role === 'consumer' && entry.producerOnly) {
    return `${name} can only send messages, so it can only be an Action or Sink.`;
  }
  if (role === 'producer' && entry.consumerOnly) {
    return `${name} can only receive messages, so it can only be a Source.`;
  }
  return null;
}

/** The entries whose title, id or description contain the query: exact matches first, then prefixes, then the rest. */
export function searchCatalogue<T extends CatalogueEntry>(entries: T[], query: string): T[] {
  if (!query.trim()) {
    return entries;
  }
  return entries
    .map(entry => ({ entry, rank: matchRank(entry, query) }))
    .filter(ranked => ranked.rank < NO_MATCH)
    .sort((a, b) => a.rank - b.rank)
    .map(ranked => ranked.entry);
}

export const NO_MATCH = 4;

/** How closely an entry matches a search: 0 for an exact id or title, up to 3 for a description, NO_MATCH for none. */
export function matchRank(entry: CatalogueEntry, query: string): number {
  const q = query.trim().toLowerCase();
  const names = [entry.name.toLowerCase(), (entry.title ?? '').toLowerCase()];
  if (names.includes(q)) {
    return 0;
  }
  if (names.some(name => name.startsWith(q))) {
    return 1;
  }
  if (names.some(name => name.includes(q))) {
    return 2;
  }
  return (entry.description ?? '').toLowerCase().includes(q) ? 3 : NO_MATCH;
}
