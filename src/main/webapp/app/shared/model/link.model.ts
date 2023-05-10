export interface ILink {
    id?: number;
    name?: string;
    bound?: string;
    transport?: string;
	  rule?: string;
    expression?: string;
	  point?: string;
    format?: string;
	  pattern?: string;
    stepId?: number;
}

export class Link implements ILink {
    constructor(
        public id?: number,
        public name?: string,
        public bound?: string,
        public transport?: string,
        public rule?: string,
        public expression?: string,
        public point?: string,
        public format?: string,
        public pattern?: string,
        public stepId?: number
    ) {}
}
