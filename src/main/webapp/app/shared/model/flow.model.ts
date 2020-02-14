import { IToEndpoint } from 'app/shared/model//to-endpoint.model';

export interface IFlow {
    id?: number;
    name?: string;
    autoStart?: boolean;
    offLoading?: boolean;
    maximumRedeliveries?: number;
    redeliveryDelay?: number;
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
        public gatewayId?: number,
        public fromEndpointId?: number,
        public errorEndpointId?: number,
        public toEndpoints?: IToEndpoint[]
    ) {
        this.autoStart = this.autoStart || false;
        this.offLoading = this.offLoading || false;
        this.maximumRedeliveries = this.maximumRedeliveries || 0;
        this.redeliveryDelay = this.redeliveryDelay || 30000;
    }
}
