import { IToEndpoint } from 'app/shared/model/to-endpoint.model';

export interface IFlow {
    id?: number;
    name?: string;
    autoStart?: boolean;
    offLoading?: boolean;
    maximumRedeliveries?: number;
    redeliveryDelay?: number;
    type?: string;
    loadBalancing?: boolean;
    instances?: number;
    logLevel?: LogLevelType;
    gatewayId?: number;
    fromEndpointId?: number;
    errorEndpointId?: number;
    toEndpoints?: IToEndpoint[];
}

export class Flow implements IFlow {
    constructor(
        public id?: number,
        public name?: string,
        public autoStart?: boolean,
        public offLoading?: boolean,
        public maximumRedeliveries?: number,
        public redeliveryDelay?: number,
        public type?: string,
        public loadBalancing?: boolean,
        public instances?: number,
        public logLevel?: LogLevelType,
        public gatewayId?: number,
        public fromEndpointId?: number,
        public errorEndpointId?: number,
        public toEndpoints?: IToEndpoint[]
    ) {
        this.autoStart = this.autoStart || false;
        this.offLoading = this.offLoading || false;
        this.loadBalancing = this.loadBalancing || false;
    }
}

export const enum LogLevelType {
    OFF = 'OFF',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    DEBUG = 'DEBUG',
    TRACE = 'TRACE'
}