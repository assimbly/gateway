export interface IServiceKeys {
    id?: number;
    key?: string;
    value?: string;
    type?: string;
    isDisabled?: boolean;
    isRequired?: boolean;
    valueType?: string;
    placeholder?: string;
    serviceId?: number;
}

export class ServiceKeys implements IServiceKeys {
    constructor(
        public id?: number,
        public key?: string,
        public value?: string,
        public type?: string,
        public isDisabled?: boolean,
        public isRequired?: boolean,
        public valueType?: string,
        public placeholder?: string,
        public serviceId?: number
    ) {}
}
