import { BaseEntity } from './../../shared';
import { EndpointType } from './../../shared/model/endpoint-type'

export class ErrorEndpoint implements BaseEntity {
    constructor(
        public id?: number,
        public type?: EndpointType,
        public uri?: string,
        public options?: string,
        public serviceId?: number,
        public headerId?: number,
    ) {
    }
}
