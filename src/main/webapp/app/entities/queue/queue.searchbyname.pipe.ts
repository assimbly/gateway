import { Pipe, PipeTransform } from '@angular/core';
import { IAddress } from 'app/shared/model/address.model';

@Pipe({ name: 'QueueSearchByName' })
export class QueueSearchByNamePipe implements PipeTransform {
    transform(addresses: IAddress[], searchText: string) {
        return addresses.filter(address => address.name.toLocaleLowerCase().indexOf(searchText.toLocaleLowerCase()) !== -1);
    }
}
