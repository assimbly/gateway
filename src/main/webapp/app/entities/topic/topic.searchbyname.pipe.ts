import { Pipe, PipeTransform } from '@angular/core';
import { IAddress } from 'app/shared/model/address.model';

@Pipe({ name: 'TopicSearchByName' })
export class TopicSearchByNamePipe implements PipeTransform {
    transform(addresses: IAddress[], searchText: string, ascending: boolean, predicate: string) {
        const asc: number = ascending ? 1 : -1;

        if (predicate == 'name') {
            addresses = addresses.sort((a, b) => (a.name.toLocaleLowerCase() < b.name.toLocaleLowerCase() ? asc : asc * -1));
        } else if (predicate == 'numberOfConsumers') {
            addresses = addresses.sort((a, b) => (a.numberOfConsumers <= b.numberOfConsumers ? asc : asc * -1));
        } else if (predicate == 'numberOfMessages') {
            addresses = addresses.sort((a, b) => (a.numberOfMessages <= b.numberOfMessages ? asc : asc * -1));
        } else if (predicate == 'address') {
            addresses = addresses.sort((a, b) => (a.address <= b.address ? asc : asc * -1));
        }

        if (searchText) {
            localStorage.setItem('searchTopicText', searchText);
            return addresses.filter(
                address =>
                    address.name.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()) ||
                    address.address.toLocaleLowerCase().includes(searchText.toLocaleLowerCase())
            );
        } else {
            localStorage.setItem('searchTopicText', '');
            return addresses;
        }
    }
}
