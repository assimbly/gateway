import { IConnectionKeys } from 'app/shared/model/connection-keys.model';

export interface IConnection {
    id?: number;
    name?: string;
    type?: string;
    connectionKeys?: IConnectionKeys[];
}

export class Connection implements IConnection {
    constructor(public id?: number, public name?: string, public type?: string, public connectionKeys?: IConnectionKeys[]) {}
}
