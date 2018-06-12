import { BaseEntity } from './../../shared';
import { EndpointType } from './../../shared/model/endpoint-type'

export class ToEndpoint implements BaseEntity {
    constructor(
        public id?: number,
        public type?: EndpointType,
        public uri?: string,
        public options?: string,
        public flowId?: number,
        public serviceId?: number,
        public headerId?: number,
    ) {
    }
}
