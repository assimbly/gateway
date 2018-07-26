import { BaseEntity } from './../../shared';
import { EndpointType } from '../../shared/camel/component-type';
import { Service } from '../service';
import { Header } from '../header';

export class WireTapEndpoint implements BaseEntity {
    constructor(
        public id?: number,
        public type?: EndpointType,
        public uri?: string,
        public options?: string,
        public service?: Service,
        public header?: Header,
    ) {
    }
}
