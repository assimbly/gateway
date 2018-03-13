import { BaseEntity } from './../../shared';

export class Flow implements BaseEntity {
    constructor(
        public id?: number,
        public name?: string,
        public gatewayId?: number,
        public fromEndpointId?: number,
        public errorEndpointId?: number,
        public toEndpoints?: BaseEntity[],
    ) {
    }
}
