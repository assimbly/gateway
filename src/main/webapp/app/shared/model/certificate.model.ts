import dayjs from 'dayjs/esm';

export interface ICertificate {
    id?: number;
    url?: string;
    certificateName?: string;
    certificateStore?: string;
    certificateExpiry?: dayjs.Dayjs;
    certificateFile?: string;
}

export class Certificate implements ICertificate {
    constructor(
        public id?: number,
        public url?: string,
        public certificateName?: string,
        public certificateStore?: string,
        public certificateExpiry?: dayjs.Dayjs,
        public certificateFile?: string
    ) {}
}
