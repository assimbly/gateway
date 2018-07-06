import { BaseEntity } from './../../shared';
import { EndpointType } from '../../shared/camel/component-type';

export class WireTapEndpoint implements BaseEntity {
    constructor(
        public id?: number,
        public type?: EndpointType,
        public uri?: string,
        public options?: string,
        public service?: BaseEntity,
        public header?: BaseEntity,
    ) {
    }
}
