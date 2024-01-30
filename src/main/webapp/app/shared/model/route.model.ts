export interface IRoute {
    id?: number;
    name?: string;
    type?: string;
    content?: any;
}

export class Route implements IRoute {
    constructor(public id?: number, public name?: string, public type?: string, public content?: any) {}
}
