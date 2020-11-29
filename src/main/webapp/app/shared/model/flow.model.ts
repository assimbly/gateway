import { IEndpoint } from 'app/shared/model/endpoint.model';
import { Moment } from 'moment';

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
    version?: number;
    created?: Moment;
    lastModified?: Moment;    
    logLevel?: LogLevelType;
    gatewayId?: number;
    endpoints?: IEndpoint[];
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
        public version?: number,
        public created?: Moment,
        public lastModified?: Moment,    
        public logLevel?: LogLevelType,
        public gatewayId?: number,
        public endpoints?: IEndpoint[]
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