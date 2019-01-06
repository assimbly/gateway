import { IServiceKeys } from 'app/shared/model//service-keys.model';

export interface IService {
    id?: number;
    name?: string;
    type?: string;
    serviceKeys?: IServiceKeys[];
}

export class Service implements IService {
    constructor(public id?: number, public name?: string, public type?: string, public serviceKeys?: IServiceKeys[]) {}
}
