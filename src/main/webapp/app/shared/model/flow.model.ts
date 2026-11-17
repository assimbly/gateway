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
    integrationId?: number;
    steps?: IStep[];
    /** The Flow's own Variables by key; its Steps refer to them as @{key}, before a global Variable with that key. */
    variables?: Record<string, string>;
}

export class Flow implements IFlow {
    variables?: Record<string, string>;

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
        public integrationId?: number,
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
