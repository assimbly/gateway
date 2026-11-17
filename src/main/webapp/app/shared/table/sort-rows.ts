import { SortState } from 'app/shared/sort';

export type SortValue = string | number | null | undefined;

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

/**
 * Sorts the rows of a list on the column of its sort state, the one way for every list that sorts in the browser:
 * text without regard to case, numbers as numbers and rows without a value last, whichever the direction.
 * A column that has no entry in `values` leaves the rows as they are.
 */
export function sortRows<T>(rows: readonly T[], state: SortState, values: Record<string, (row: T) => SortValue>): T[] {
  const valueOf = state.predicate ? values[state.predicate] : undefined;
  if (!valueOf || !state.order) {
    return [...rows];
  }
  const direction = state.order === 'desc' ? -1 : 1;
  return [...rows].sort((a, b) => {
    const left = valueOf(a);
    const right = valueOf(b);
    const leftEmpty = left === null || left === undefined || left === '';
    const rightEmpty = right === null || right === undefined || right === '';
    if (leftEmpty || rightEmpty) {
      return leftEmpty === rightEmpty ? 0 : leftEmpty ? 1 : -1;
    }
    if (typeof left === 'number' && typeof right === 'number') {
      return (left - right) * direction;
    }
    return collator.compare(String(left), String(right)) * direction;
  });
}
