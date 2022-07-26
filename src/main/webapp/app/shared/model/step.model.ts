export const enum StepType {
    FROM = 'FROM',
    TO = 'TO',
    ERROR = 'ERROR',
    RESPONSE = 'RESPONSE',
    ROUTE = 'ROUTE',
    API = 'API'
}

export interface IStep {
    id?: number;
    stepType?: StepType;
    componentType?: string;
    uri?: string;
    options?: string;
    responseId?: number;
    flowId?: number;
    serviceId?: number;
    headerId?: number;
    routeId?: number;
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
        public serviceId?: number,
        public headerId?: number,
        public routeId?: number
    ) {}
}
