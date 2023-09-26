import { IIntegration } from 'app/shared/model/integration.model';
import { IUser } from 'app/entities/user/user.model';

export interface IGroup {
  id?: number;
  name?: string;
  gateways?: IIntegration[];
  users?: IUser[];
}

export class Group implements IGroup {
  constructor(public id?: number, public name?: string, public gateways?: IIntegration[], public users?: IUser[]) {}
}
