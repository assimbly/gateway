export interface IRootQueueAddress {
    queues: IQueueAddresses;
}

export interface IQueueAddresses {
    queue: Address[];
}

export interface IRootTopicAddresses {
    topics: ITopicAddresses;
}

export interface ITopicAddresses {
    topic: Address[];
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
