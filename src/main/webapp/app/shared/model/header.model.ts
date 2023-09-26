export interface IHeader {
    id?: number;
    key?: string;
    value?: string;
    type?: string;
    language?: string;
    messageId?: number;
    isDisabled?: boolean;
}

export class Header implements IHeader {
    constructor(
        public id?: number,
        public key?: string,
        public value?: string,
        public type?: string,
        public language?: string,
        public messageId?: number,
        public isDisabled?: boolean
    ) {}
}
