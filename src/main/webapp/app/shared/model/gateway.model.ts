import { IFlow } from 'app/shared/model//flow.model';
import { IEnvironmentVariables } from 'app/shared/model//environment-variables.model';

export const enum GatewayType {
    ADAPTER = 'ADAPTER',
    BROKER = 'BROKER',
    ARTEMIS = 'ARTEMIS',
    SOAP = 'SOAP'
}

export const enum EnvironmentType {
    DEVELOPMENT = 'DEVELOPMENT',
    TEST = 'TEST',
    ACCEPTANCE = 'ACCEPTANCE',
    PRODUCTION = 'PRODUCTION'
}

export const enum ConnectorType {
    CAMEL = 'CAMEL',
    SPRINGINTEGRATION = 'SPRINGINTEGRATION',
    CURL = 'CURL'
}

export interface IGateway {
    id?: number;
    name?: string;
    type?: GatewayType;
    environmentName?: string;
    stage?: EnvironmentType;
    connectorType?: ConnectorType;
    defaultFromEndpointType?: string;
    defaultToEndpointType?: string;
    defaultErrorEndpointType?: string;
    wiretapEndpointId?: number;
    flows?: IFlow[];
    environmentVariables?: IEnvironmentVariables[];
}

export class Gateway implements IGateway {
    constructor(
        public id?: number,
        public name?: string,
        public type?: GatewayType,
        public environmentName?: string,
        public stage?: EnvironmentType,
        public connectorType?: ConnectorType,
        public defaultFromEndpointType?: string,
        public defaultToEndpointType?: string,
        public defaultErrorEndpointType?: string,
        public wiretapEndpointId?: number,
        public flows?: IFlow[],
        public environmentVariables?: IEnvironmentVariables[]
    ) {}
}
