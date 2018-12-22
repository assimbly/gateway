export interface IServiceKeys {
    id?: number;
    key?: string;
    value?: string;
    serviceKeysId?: number;
}

export class ServiceKeys implements IServiceKeys {
    constructor(public id?: number, public key?: string, public value?: string, public serviceKeysId?: number) {}
}
