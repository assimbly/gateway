import moment from 'moment';

export interface ISecurity {
    id?: number;
    url?: string;
    certificateName?: string;
    certificateStore?: string;
    certificateExpiry?: moment.Moment;
    certificateFile?: string;
}

export class Security implements ISecurity {
    constructor(
        public id?: number,
        public url?: string,
        public certificateName?: string,
        public certificateStore?: string,
        public certificateExpiry?: moment.Moment,
        public certificateFile?: string
    ) {}
}
