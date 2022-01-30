import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'SearchByName' })
export class SearchByNamePipe implements PipeTransform {
    logLines: string[] = [];

    transform(logLines: string[], searchText: string) {
        if (logLines instanceof Array) {
            return logLines.filter(logLine => logLine.toLocaleLowerCase().indexOf(searchText.toLocaleLowerCase()) !== -1);
        }
        return [];
    }
}
