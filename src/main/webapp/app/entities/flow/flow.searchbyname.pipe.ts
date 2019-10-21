import { Pipe, PipeTransform } from '@angular/core';
import { IFlow } from 'app/shared/model/flow.model';
 
@Pipe({ name: 'FlowSearchByName' })
export class FlowSearchByNamePipe implements PipeTransform {
  transform(flows: IFlow[], searchText: string) {
    return flows.filter(flow => flow.name.indexOf(searchText) !== -1);
  }
}