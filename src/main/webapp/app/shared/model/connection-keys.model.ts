export interface IConnectionKeys {
    id?: number;
    key?: string;
    value?: string;
    type?: string;
    isDisabled?: boolean;
    isRequired?: boolean;
    valueType?: string;
    placeholder?: string;
    connectionId?: number;
}

export class ConnectionKeys implements IConnectionKeys {
    constructor(
        public id?: number,
        public key?: string,
        public value?: string,
        public type?: string,
        public isDisabled?: boolean,
        public isRequired?: boolean,
        public valueType?: string,
        public placeholder?: string,
        public connectionId?: number
    ) {}
}
