import { BaseEntity } from './../../shared';

export const enum GatewayType {
    'FILE',
    'BROKER'
}

export const enum EnvironmentType {
    'DEVELOPMENT',
    'TEST',
    'ACCEPTANCE',
    'PRODUCTION'
}

export class Gateway implements BaseEntity {
    constructor(
        public id?: number,
        public name?: string,
        public type?: GatewayType,
        public environmentName?: string,
        public stage?: EnvironmentType,
        public defaultFromEndpointType?: string,
        public defaultToEndpointType?: string,
        public defaultErrorEndpointType?: string,
        public flowRoutes?: BaseEntity[],
        public environmentVariables?: BaseEntity[],
    ) {
    }
}
