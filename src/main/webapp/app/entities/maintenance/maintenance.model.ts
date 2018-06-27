import { BaseEntity } from './../../shared';

export class Maintenance implements BaseEntity {
    constructor(
        public id?: number,
        public startTime?: Date,
        public endTime?: Date
    ) {
    }
}