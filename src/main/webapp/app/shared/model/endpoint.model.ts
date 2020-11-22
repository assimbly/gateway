export const enum ComponentType {
    ACTIVEMQ = 'ACTIVEMQ',
    FILE = 'FILE',
    HTTP = 'HTTP',
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

export interface IEndpoint {
    id?: number;
    componentType?: ComponentType;
    uri?: string;
    options?: string;
    flowId?: number;
    serviceId?: number;
    headerId?: number;
}

export class Endpoint implements IEndpoint {
    constructor(
        public id?: number,
        public componentType?: ComponentType,
        public uri?: string,
        public options?: string,
        public flowId?: number,
        public serviceId?: number,
        public headerId?: number
    ) {}
}
