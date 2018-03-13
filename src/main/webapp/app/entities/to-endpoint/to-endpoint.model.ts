import { BaseEntity } from './../../shared';

export const enum EndpointType {
    'SONICMQ',
    'ACTIVEMQ',
    'SJMS',
    'SQL',
    'HTTP4',
    'SFTP',
    'STREAM',
    'WASTEBIN',
    'FILE'
}

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
