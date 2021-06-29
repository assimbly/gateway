export interface Welcome3 {
    queues: IAddresses;
}

export interface IAddresses {
    queues: IAddress[];
}

export interface IAddress {
    address?: string;
    name?: string;
    numberOfConsumers?: number;
    numberOfMessages?: number;
    size?: number;
    temporary?: boolean;
}

export class Address implements IAddress {
    constructor(
        public id?: number,
        public address?: string,
        public name?: string,
        public numberOfConsumers?: number,
        public numberOfMessages?: number,
        public size?: number,
        public temporary?: boolean
    ) {}
}
