export interface IEnvironmentVariables {
    id?: number;
    key?: string;
    value?: string;
    encrypted?: boolean;
    integrationId?: number;
}

export class EnvironmentVariables implements IEnvironmentVariables {
    constructor(public id?: number, public key?: string, public value?: string, public encrypted?: boolean, public integrationId?: number) {}
}
