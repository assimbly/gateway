export const enum EndpointType {
    SONICMQ = 'SONICMQ',
    ACTIVEMQ = 'ACTIVEMQ',
    SJMS = 'SJMS',
    SQL = 'SQL',
    HTTP4 = 'HTTP4',
    SFTP = 'SFTP',
    STREAM = 'STREAM',
    WASTEBIN = 'WASTEBIN',
    FILE = 'FILE'
}

export interface IToEndpoint {
    id?: number;
    type?: EndpointType;
    uri?: string;
    options?: string;
    flowId?: number;
    serviceId?: number;
    headerId?: number;
}

export class ToEndpoint implements IToEndpoint {
    constructor(
        public id?: number,
        public type?: EndpointType,
        public uri?: string,
        public options?: string,
        public flowId?: number,
        public serviceId?: number,
        public headerId?: number
    ) {}
}
