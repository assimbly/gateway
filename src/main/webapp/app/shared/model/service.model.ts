export interface IService {
    id?: number;
    name?: string;
    type?: string;
    url?: string;
    username?: string;
    password?: string;
    driver?: string;
    configuration?: string;
}

export class Service implements IService {
    constructor(
        public id?: number,
        public name?: string,
        public type?: string,
        public url?: string,
        public username?: string,
        public password?: string,
        public driver?: string,
        public configuration?: string
    ) {}
}
