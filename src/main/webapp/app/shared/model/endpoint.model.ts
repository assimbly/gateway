export const enum EndpointType {
    FROM = 'FROM',
    TO = 'TO',
    ERROR = 'ERROR',
    RESPONSE = 'RESPONSE',
    SERVICE = 'SERVICE'
}

export interface IEndpoint {
    id?: number;
    endpointType?: EndpointType;
    componentType?: string;
    uri?: string;
    options?: string;
    responseId?: number;
    flowId?: number;
    serviceId?: number;
    headerId?: number;
    routeId?: number;
}

export class Endpoint implements IEndpoint {
    constructor(
        public id?: number,
        public endpointType?: EndpointType,
        public componentType?: string,
        public uri?: string,
        public options?: string,
        public responseId?: number,
        public flowId?: number,
        public serviceId?: number,
        public headerId?: number,
        public routeId?: number
    ) {}
}
