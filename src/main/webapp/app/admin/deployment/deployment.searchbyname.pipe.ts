import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'DeploymentSearchByName' })
export class DeploymentSearchbyname implements PipeTransform {
    logLines: string[] = [];

    transform(logLines: string[], searchText: string) {
        if (logLines instanceof Array) {
            return logLines.filter(logLine => logLine.toLocaleLowerCase().indexOf(searchText.toLocaleLowerCase()) !== -1);
        }
        return [];
    }
}
