import { BaseEntity } from './../../shared';

export class Maintenance implements BaseEntity {
    constructor(
        public id?: number,
        public startTime?: any,
        public endTime?: any,
        public flows?: BaseEntity[],
    ) {
    }
}
