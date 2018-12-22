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

export interface IFromEndpoint {
    id?: number;
    type?: EndpointType;
    uri?: string;
    options?: string;
    serviceId?: number;
    headerId?: number;
}

export class FromEndpoint implements IFromEndpoint {
    constructor(
        public id?: number,
        public type?: EndpointType,
        public uri?: string,
        public options?: string,
        public serviceId?: number,
        public headerId?: number
    ) {}
}
