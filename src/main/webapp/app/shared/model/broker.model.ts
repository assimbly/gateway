export interface IBroker {
    id?: number;
    name?: string;
    type?: string;
    configurationType?: string;
    autoStart?: boolean;
}

export class Broker implements IBroker {
    constructor(
        public id?: number,
        public name?: string,
        public type?: string,
        public configurationType?: string,
        public autoStart?: boolean
    ) {
        this.autoStart = this.autoStart || false;
    }
}
