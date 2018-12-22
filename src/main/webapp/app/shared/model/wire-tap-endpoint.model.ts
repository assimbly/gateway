import { IService } from 'app/shared/model/service.model';
import { IHeader } from 'app/shared/model/header.model';

export const enum EndpointType {
    SONICMQ = 'SONICMQ',
    ACTIVEMQ = ' ACTIVEMQ',
    KAFKA = ' KAFKA',
    SJMS = ' SJMS',
    SQL = ' SQL',
    HTTP4 = ' HTTP4',
    SFTP = ' SFTP',
    STREAM = ' STREAM',
    WASTEBIN = ' WASTEBIN',
    FILE = ' FILE',
    VM = ' VM'
}

export interface IWireTapEndpoint {
    id?: number;
    type?: EndpointType;
    uri?: string;
    options?: string;
    service?: IService;
    header?: IHeader;
}

export class WireTapEndpoint implements IWireTapEndpoint {
    constructor(
        public id?: number,
        public type?: EndpointType,
        public uri?: string,
        public options?: string,
        public service?: IService,
        public header?: IHeader
    ) {}
}
