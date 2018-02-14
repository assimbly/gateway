import { BaseEntity } from './../../shared';

export class Service implements BaseEntity {
    constructor(
        public id?: number,
        public name?: string,
        public type?: string,
        public url?: string,
        public username?: string,
        public password?: string,
        public driver?: string,
        public configuration?: string,
    ) {
    }
}
