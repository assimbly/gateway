import { Moment } from 'moment';

export interface IMaintenance {
    id?: number;
    startTime?: Moment;
    endTime?: Moment;
    duration?: Moment;
    frequency?: string;
    flowId?: number;
}

export class Maintenance implements IMaintenance {
    constructor(
        public id?: number,
        public startTime?: Moment,
        public endTime?: Moment,
        public duration?: Moment,
        public frequency?: string,
        public flowId?: number
    ) {}
}
