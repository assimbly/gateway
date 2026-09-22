import { Pipe, PipeTransform } from '@angular/core';
import { IAddress } from 'app/shared/model/address.model';

@Pipe({ name: 'TopicSearchByName' })
export class TopicSearchByNamePipe implements PipeTransform {
    transform(addresses: IAddress[], searchText: string, ascending: boolean, predicate: string) {
        if (!addresses) {
            return [];
        }

        const asc: number = ascending ? 1 : -1;
        let result = [...addresses];

        if (predicate == 'name') {
            result = result.sort((a, b) => ((a.name ?? '').toLocaleLowerCase() < (b.name ?? '').toLocaleLowerCase() ? asc : asc * -1));
        } else if (predicate == 'numberOfConsumers') {
            result = result.sort((a, b) => ((a.numberOfConsumers ?? 0) <= (b.numberOfConsumers ?? 0) ? asc : asc * -1));
        } else if (predicate == 'numberOfMessages') {
            result = result.sort((a, b) => ((a.numberOfMessages ?? 0) <= (b.numberOfMessages ?? 0) ? asc : asc * -1));
        }

        if (searchText) {
            const query = searchText.toLocaleLowerCase();
            return result.filter(
                address =>
                    (address.name ?? '').toLocaleLowerCase().includes(query) || (address.address ?? '').toLocaleLowerCase().includes(query)
            );
        }
        return result;
    }
}
