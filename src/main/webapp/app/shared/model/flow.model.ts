import { IEndpoint } from 'app/shared/model/endpoint.model';
import { Moment } from 'moment';

export interface IFlow {
    id?: number;
    name?: string;
    notes?: string;
    autoStart?: boolean;
    offLoading?: boolean;
    maximumRedeliveries?: number;
    redeliveryDelay?: number;
    type?: string;
    loadBalancing?: boolean;
	parallelProcessing?: boolean;
	assimblyHeaders?: boolean;
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
        public notes?: string,
        public autoStart?: boolean,
        public offLoading?: boolean,
        public maximumRedeliveries?: number,
        public redeliveryDelay?: number,
        public type?: string,
        public loadBalancing?: boolean,
        public parallelProcessing?: boolean,
        public assimblyHeaders?: boolean,
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
		this.parallelProcessing = this.parallelProcessing || true;
		this.assimblyHeaders = this.assimblyHeaders || true;
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