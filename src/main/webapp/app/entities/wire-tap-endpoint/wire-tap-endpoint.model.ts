import { BaseEntity } from './../../shared';

export const enum EndpointType {
    'SONICMQ',
    ' ACTIVEMQ',
    ' KAFKA',
    ' SJMS',
    ' SQL',
    ' HTTP4',
    ' SFTP',
    ' STREAM',
    ' WASTEBIN',
    ' FILE',
    ' VM'
}

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
