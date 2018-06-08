import { BaseEntity } from './../../shared';

export class HeaderKeys implements BaseEntity {
    constructor(
        public id?: number,
        public key?: string,
        public value?: string,
        public type?: string,
        public headerId?: number,
        public isDisabled?: boolean
    ) {
    }
}
