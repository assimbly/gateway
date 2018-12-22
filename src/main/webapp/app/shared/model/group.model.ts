import { IGateway } from 'app/shared/model/gateway.model';
import { IUser } from 'app/core/user/user.model';

export interface IGroup {
    id?: number;
    name?: string;
    gateways?: IGateway[];
    users?: IUser[];
}

export class Group implements IGroup {
    constructor(public id?: number, public name?: string, public gateways?: IGateway[], public users?: IUser[]) {}
}
