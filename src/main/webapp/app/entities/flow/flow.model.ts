import { BaseEntity } from './../../shared';
import { ToEndpoint } from './../to-endpoint';

export class Flow implements BaseEntity {
    constructor(
        public id?: number,
        public name?: string,
        public autoStart?: boolean,
        public offloading?: boolean,
        public gatewayId?: number,
        public fromEndpointId?: number,
        public errorEndpointId?: number,
        public toEndpoints?: ToEndpoint[]
    ) {
    }
}
