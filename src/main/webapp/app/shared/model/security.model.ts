import { Moment } from 'moment';

export interface ISecurity {
    id?: number;
    url?: string;
    certificateName?: string;
    certificateExpiry?: Moment;
    certificateFile?: string;
}

export class Security implements ISecurity {
    constructor(
        public id?: number,
        public url?: string,
        public certificateName?: string,
        public certificateExpiry?: Moment,
        public certificateFile?: string
    ) {}
}
