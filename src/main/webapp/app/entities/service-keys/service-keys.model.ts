import { BaseEntity } from './../../shared';

export class ServiceKeys implements BaseEntity {
    constructor(
        public id?: number,
        public key?: string,
        public value?: string,
        public serviceKeysId?: number,
    ) {
    }
}
