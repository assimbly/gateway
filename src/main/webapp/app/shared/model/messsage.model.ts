import { HeaderKeys, IHeaderKeys } from 'app/shared/model/header-keys.model';

export interface IRootMessages {
    messages: IMessages;
}

export interface IMessages {
    queue: Message[];
}

export interface IMessage {
    id?: number;
    fileType?: string;
    number?: number;
    timestamp?: string;
    messageid?: string;
    type?: string;
    body?: string;
    headers?: any;
    headerKeys?: IHeaderKeys[];
    jmsHeaders?: any;
}

export class Message implements IMessage {
    constructor(
        public id?: number,
        public fileType?: string,
        public number?: number,
        public timestamp?: string,
        public messageid?: string,
        public type?: string,
        public headers?: any,
        public headerKeys?: HeaderKeys[],
        public jmsHeaders?: any
    ) {}
}
