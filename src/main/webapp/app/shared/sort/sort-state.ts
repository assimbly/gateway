import { WritableSignal, signal } from '@angular/core';

export type SortOrder = 'asc' | 'desc';

export type SortState = { predicate?: string; order?: SortOrder };

export function sortParams(sortState: SortState, tieBreaker = 'name'): string[] {
  const { predicate, order } = sortState;
  const result = [predicate + ',' + order];
  if (predicate !== tieBreaker) {
    result.push(tieBreaker);
  }
  return result;
}

export const sortStateSignal = (state: SortState): WritableSignal<SortState> =>
  signal(state, {
    equal: (a, b) => a.predicate === b.predicate && a.order === b.order,
  });
