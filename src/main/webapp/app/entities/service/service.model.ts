import { BaseEntity } from './../../shared';

export class Service implements BaseEntity {
    constructor(
        public id?: number,
        public name?: string,
        public type?: string,
        public serviceKeys?: BaseEntity[]
    ) {
    }
}
