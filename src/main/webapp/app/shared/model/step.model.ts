import { ILink } from 'app/shared/model/link.model';

export const enum StepType {
    FROM = 'FROM',
    TO = 'TO',
    ERROR = 'ERROR',
    RESPONSE = 'RESPONSE',
    SOURCE = 'SOURCE',
    SINK = 'SINK',
    ACTION = 'ACTION',
    ROUTER = 'ROUTER',
    ROUTE = 'ROUTE',
    ROUTECONFIGURATION = 'ROUTECONFIGURATION',
    ROUTETEMPLATE = 'ROUTETEMPLATE',
    MESSAGE = 'MESSAGE',
    CONNECTION = 'CONNECTION',
    API = 'API',
    SCRIPT = 'SCRIPT',
}

export interface IStep {
    id?: number;
    stepType?: StepType;
    componentType?: string;
    uri?: string;
    options?: string;
    responseId?: number;
    flowId?: number;
    connectionId?: number;
    messageId?: number;
    routeId?: number;
    links?: ILink[];
}

export class Step implements IStep {
    constructor(
        public id?: number,
        public stepType?: StepType,
        public componentType?: string,
        public uri?: string,
        public options?: string,
        public responseId?: number,
        public flowId?: number,
        public connectionId?: number,
        public messageId?: number,
        public routeId?: number,
        public links?: ILink[],
    ) {}
}
