export interface IEnvironmentVariables {
    id?: number;
    key?: string;
    value?: string;
    encrypt?: boolean;
    gatewayId?: number;
}

export class EnvironmentVariables implements IEnvironmentVariables {
    constructor(public id?: number, public key?: string, public value?: string, public encrypt?: boolean, public gatewayId?: number) {}
}
