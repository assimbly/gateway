import { Header, IHeader } from 'app/shared/model/header.model';

export interface IRootMessages {
    messages: IMessages;
}

export interface IMessages {
    queue: Message[];
}

export interface IMessage {
    id?: number;
    name?: string;
    type?: string;
    body?: string;
    language?: string;
    header?: IHeader[];
    fileType?: string;
    number?: number;
    timestamp?: string;
    messageid?: string;
    headers?: any;
    jmsHeaders?: any;
}

export class Message implements IMessage {
    constructor(
        public id?: number,
        public name?: string,
        public type?: string,
        public body?: string,
        public language?: string,
        public headers?: any,
        public fileType?: string,
        public number?: number,
        public timestamp?: string,
        public messageid?: string,
        public header?: Header[],
        public jmsHeaders?: any
    ) {}
}
