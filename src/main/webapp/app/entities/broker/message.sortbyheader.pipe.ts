import { Pipe, PipeTransform } from '@angular/core';
import { KeyValue } from '@angular/common';
import { Header } from 'app/shared/model/header.model';

@Pipe({ standalone: false, name: 'MessageSortByHeaderPipe' })
export class MessageSortByHeaderPipePipe implements PipeTransform {
    transform(headers: KeyValue<string, any>[], ascending: boolean, predicate: string) {
        let sortedHeaders: Header[] = [];

        if(headers){

          for (let i = 0; i < headers.length; i++) {
              sortedHeaders.push(new Header(i, headers[i].key, headers[i].value, null, null, null));
          }
          const asc: number = ascending ? 1 : -1;

          if (predicate == 'key') {
              sortedHeaders = sortedHeaders.sort((a, b) => (a.key.toLocaleLowerCase() < b.key.toLocaleLowerCase() ? asc : asc * -1));
          } else if (predicate == 'value') {
              sortedHeaders = sortedHeaders.sort((a, b) => (a.value <= b.value ? asc : asc * -1));
          }

        }

        return sortedHeaders;
    }
}
