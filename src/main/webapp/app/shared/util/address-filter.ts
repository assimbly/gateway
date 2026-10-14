import { IAddress } from 'app/shared/model/address.model';
import { sortRows } from 'app/shared/table/sort-rows';

/** Filters the Queues or Topics on their name and sorts them on a column, the way the arrow of that column says. */
export function filterAddresses(
  addresses: IAddress[] | null | undefined,
  searchText: string,
  ascending: boolean,
  predicate: string,
  includeAddress = false,
): IAddress[] {
  if (!addresses) {
    return [];
  }

  const result = sortRows(
    addresses,
    { predicate, order: ascending ? 'asc' : 'desc' },
    {
      name: address => address.name,
      numberOfConsumers: address => address.numberOfConsumers ?? 0,
      numberOfMessages: address => address.numberOfMessages ?? 0,
    },
  );

  if (searchText) {
    const query = searchText.toLocaleLowerCase();
    return result.filter(address => {
      const nameMatches = (address.name ?? '').toLocaleLowerCase().includes(query);
      return includeAddress ? nameMatches || (address.address ?? '').toLocaleLowerCase().includes(query) : nameMatches;
    });
  }
  return result;
}
