import { BaseEntity, User } from './../../shared';

export class Group implements BaseEntity {
    constructor(
        public id?: number,
        public name?: string,
        public gateways?: BaseEntity[],
        public users?: User[],
    ) {
    }
}
