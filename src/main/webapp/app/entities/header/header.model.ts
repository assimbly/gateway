import { BaseEntity } from './../../shared';

export class Header implements BaseEntity {
    constructor(
        public id?: number,
        public name?: string,
        public headerKeys?: BaseEntity[],
    ) {
    }
}
