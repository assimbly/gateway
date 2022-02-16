import dayjs from 'dayjs/esm';

export interface IMaintenance {
    id?: number;
    startTime?: dayjs.Dayjs;
    endTime?: dayjs.Dayjs;
    duration?: dayjs.Dayjs;
    frequency?: string;
    flowId?: number;
}

export class Maintenance implements IMaintenance {
    constructor(
        public id?: number,
        public startTime?: dayjs.Dayjs,
        public endTime?: dayjs.Dayjs,
        public duration?: dayjs.Dayjs,
        public frequency?: string,
        public flowId?: number
    ) {}
}
