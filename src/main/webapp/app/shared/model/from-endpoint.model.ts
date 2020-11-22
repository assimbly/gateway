export enum ComponentType {
    ACTIVEMQ = 'ACTIVEMQ',
    FILE = 'FILE',
    HTTP = 'HTTP',
    HTTPS = 'HTTPS',
    KAFKA = 'KAFKA',
    SFTP = 'SFTP',
    SJMS = 'SJMS',
    SMTP = 'SMTP',
    SONICMQ = 'SONICMQ',
    SQL = 'SQL',
    STREAM = 'STREAM',
    VM = 'VM',
    WASTEBIN = 'WASTEBIN'
}

export interface IFromEndpoint {
    id?: number;
    type?: ComponentType;
    uri?: string;
    options?: string;
    serviceId?: number;
    headerId?: number;
}

export class FromEndpoint implements IFromEndpoint {
    constructor(
        public id?: number,
        public type?: ComponentType,
        public uri?: string,
        public options?: string,
        public serviceId?: number,
        public headerId?: number
    ) {}
}
