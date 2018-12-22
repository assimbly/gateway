import { BaseEntity } from './../../shared';

export class EnvironmentVariables implements BaseEntity {
    constructor(
        public id?: number,
        public key?: string,
        public value?: string,
        public gatewayId?: number,
    ) {
    }
}
