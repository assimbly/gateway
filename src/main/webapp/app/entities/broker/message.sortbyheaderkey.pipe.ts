import { Pipe, PipeTransform } from '@angular/core';
import { KeyValue } from '@angular/common';
import { HeaderKeys } from 'app/shared/model/header-keys.model';

@Pipe({ name: 'MessageSortByHeaderKeyPipe' })
export class MessageSortByHeaderKeyPipePipe implements PipeTransform {
    transform(headers: KeyValue<string, any>[], ascending: boolean, predicate: string) {
        let sortedHeaders: HeaderKeys[] = [];

        for (let i: number = 0; i < headers.length; i++) {
            sortedHeaders.push(new HeaderKeys(i, headers[i].key, headers[i].value, null, null, null));
        }
        let asc: number = ascending ? 1 : -1;

        if (predicate == 'key') {
            sortedHeaders = sortedHeaders.sort((a, b) => (a.key.toLocaleLowerCase() < b.key.toLocaleLowerCase() ? asc : asc * -1));
        } else if (predicate == 'value') {
            sortedHeaders = sortedHeaders.sort((a, b) => (a.value <= b.value ? asc : asc * -1));
        }
        return sortedHeaders;
    }
}
