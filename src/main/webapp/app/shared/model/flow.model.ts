import { IStep } from 'app/shared/model/step.model';
import dayjs from 'dayjs/esm';

export interface IFlow {
    id?: number;
    name?: string;
    notes?: string;
    autoStart?: boolean;
    maximumRedeliveries?: number;
    redeliveryDelay?: number;
    type?: string;
    loadBalancing?: boolean;
    parallelProcessing?: boolean;
    instances?: number;
    version?: number;
    created?: dayjs.Dayjs;
    lastModified?: dayjs.Dayjs;
    logLevel?: LogLevelType;
    gatewayId?: number;
    steps?: IStep[];
}

export class Flow implements IFlow {
    constructor(
        public id?: number,
        public name?: string,
        public notes?: string,
        public autoStart?: boolean,
        public maximumRedeliveries?: number,
        public redeliveryDelay?: number,
        public type?: string,
        public loadBalancing?: boolean,
        public parallelProcessing?: boolean,
        public instances?: number,
        public version?: number,
        public created?: dayjs.Dayjs,
        public lastModified?: dayjs.Dayjs,
        public logLevel?: LogLevelType,
        public gatewayId?: number,
        public steps?: IStep[]
    ) {
        this.autoStart = this.autoStart || false;
        this.loadBalancing = this.loadBalancing || false;
        this.parallelProcessing = this.parallelProcessing || true;
    }
}

export const enum LogLevelType {
    OFF = 'OFF',
    ON = 'ON',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    DEBUG = 'DEBUG',
    TRACE = 'TRACE'
}
