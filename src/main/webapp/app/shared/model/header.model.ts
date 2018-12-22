import { IHeaderKeys } from 'app/shared/model/header-keys.model';

export interface IHeader {
    id?: number;
    name?: string;
    headerKeys?: IHeaderKeys[];
}

export class Header implements IHeader {
    constructor(public id?: number, public name?: string, public headerKeys?: IHeaderKeys[]) {}
}
