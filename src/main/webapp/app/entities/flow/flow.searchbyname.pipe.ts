import { Pipe, PipeTransform } from '@angular/core';
import { IFlow } from 'app/shared/model/flow.model';

@Pipe({ name: 'FlowSearchByName' })
export class FlowSearchByNamePipe implements PipeTransform {
    transform(flows: IFlow[], searchText: string, ascending = true, predicate = 'name') {
        if (!flows) {
            return [];
        }

        let result = [...flows];
        if (predicate === 'name') {
            result = result.sort((a, b) => {
                const comparison = (a.name ?? '').toLocaleLowerCase().localeCompare((b.name ?? '').toLocaleLowerCase());
                return ascending ? comparison : -comparison;
            });
        }

        if (searchText) {
            return result.filter(flow => (flow.name ?? '').toLocaleLowerCase().includes(searchText.toLocaleLowerCase()));
        }
        return result;
    }
}
