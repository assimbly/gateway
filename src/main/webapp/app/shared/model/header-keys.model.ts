export interface IHeaderKeys {
    id?: number;
    key?: string;
    value?: string;
    type?: string;
    language?: string;
    headerId?: number;
    isDisabled?: boolean;
}

export class HeaderKeys implements IHeaderKeys {
    constructor(
        public id?: number,
        public key?: string,
        public value?: string,
        public type?: string,
        public language?: string,
        public headerId?: number,
        public isDisabled?: boolean
    ) {}
}
