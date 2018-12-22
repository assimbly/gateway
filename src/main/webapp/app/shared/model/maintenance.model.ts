import { Moment } from 'moment';
import { IFlow } from 'app/shared/model/flow.model';

export interface IMaintenance {
    id?: number;
    startTime?: Moment;
    endTime?: Moment;
    flows?: IFlow[];
}

export class Maintenance implements IMaintenance {
    constructor(public id?: number, public startTime?: Moment, public endTime?: Moment, public flows?: IFlow[]) {}
}
