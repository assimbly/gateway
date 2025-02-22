import { IFlow } from 'app/shared/model//flow.model';
import { IEnvironmentVariables } from 'app/shared/model//environment-variables.model';

export const enum GatewayType {
    FULL = 'FULL',
    CONNECTOR = 'CONNECTOR',
    BROKER = 'BROKER'
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

export interface IIntegration {
    id?: number;
    name?: string;
    type?: GatewayType;
    environmentName?: string;
    stage?: EnvironmentType;
    connectorType?: ConnectorType;
    defaultFromComponentType?: string;
    defaultToComponentType?: string;
    defaultErrorComponentType?: string;
    flows?: IFlow[];
    environmentVariables?: IEnvironmentVariables[];
}

export class Integration implements IIntegration {
    constructor(
        public id?: number,
        public name?: string,
        public type?: GatewayType,
        public environmentName?: string,
        public stage?: EnvironmentType,
        public connectorType?: ConnectorType,
        public defaultFromComponentType?: string,
        public defaultToComponentType?: string,
        public defaultErrorComponentType?: string,
        public flows?: IFlow[],
        public environmentVariables?: IEnvironmentVariables[]
    ) {}
}
