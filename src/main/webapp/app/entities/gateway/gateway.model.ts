import { BaseEntity } from './../../shared';
import { EndpointType } from '../../shared/camel/component-type';

export const enum GatewayType {
    ADAPTER = 'ADAPTER',
    BROKER = 'BROKER'
}

export const enum EnvironmentType {
    DEVELOPMENT= 'DEVELOPMENT',
    TEST= 'TEST',
    ACCEPTANCE = 'ACCEPTANCE',
    PRODUCTION = 'PRODUCTION'
}

export class Gateway implements BaseEntity {
    constructor(
        public id?: number,
        public name?: string,
        public type?: GatewayType,
        public environmentName?: string,
        public stage?: EnvironmentType,
        public defaultFromEndpointType?: EndpointType,
        public defaultToEndpointType?: EndpointType,
        public defaultErrorEndpointType?: EndpointType,
        public flows?: BaseEntity[],
        public environmentVariables?: BaseEntity[]
    ) {
    }
}
