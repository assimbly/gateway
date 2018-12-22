export interface IEnvironmentVariables {
    id?: number;
    key?: string;
    value?: string;
    gatewayId?: number;
}

export class EnvironmentVariables implements IEnvironmentVariables {
    constructor(public id?: number, public key?: string, public value?: string, public gatewayId?: number) {}
}
