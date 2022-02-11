import moment from 'moment';

export interface IMaintenance {
    id?: number;
    startTime?: moment.Moment;
    endTime?: moment.Moment;
    duration?: moment.Moment;
    frequency?: string;
    flowId?: number;
}

export class Maintenance implements IMaintenance {
    constructor(
        public id?: number,
        public startTime?: moment.Moment,
        public endTime?: moment.Moment,
        public duration?: moment.Moment,
        public frequency?: string,
        public flowId?: number
    ) {}
}
