import { BaseEntity } from './../../shared';

export class ServiceKeys implements BaseEntity {
    constructor(
        public id?: number,
        public key?: string,
        public value?: string,
        public type?: string,
        public isDisabled?: boolean,
        public isRequired?: boolean,
        public valueType?: string,
        public serviceId?: number
    ) {
    }
}
