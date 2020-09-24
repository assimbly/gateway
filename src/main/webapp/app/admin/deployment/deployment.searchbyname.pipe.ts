import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'DeploymentSearchByName' })
export class DeploymentSearchbyname implements PipeTransform {
    transform(value: any, ...args: any[]): any {}
}
