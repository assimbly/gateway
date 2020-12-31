export const enum EndpointType {
    FROM = 'FROM',
    TO = 'TO',
    ERROR = 'ERROR',
    RESPONSE = 'RESPONSE',
	WIRETAP = 'WIRETAP'
}

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
	endpointType?: EndpointType;
    componentType?: ComponentType;
    uri?: string;
    options?: string;
    responseId?: number;
	flowId?: number;
    serviceId?: number;
    headerId?: number;
}

export class Endpoint implements IEndpoint {
    constructor(
        public id?: number,
		public endpointType?: EndpointType,        
		public componentType?: ComponentType,
        public uri?: string,
        public options?: string,
		public responseId?: number,        
		public flowId?: number,
        public serviceId?: number,
        public headerId?: number
    ) {}
}
