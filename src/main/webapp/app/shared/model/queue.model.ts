export interface IQueue {
    id?: number;
    itemsOnPage?: number;
    refreshInterval?: number;
    selectedColumn?: string;
    orderColumn?: string;
}

export class Queue implements IQueue {
    constructor(
        public id?: number,
        public itemsOnPage?: number,
        public refreshInterval?: number,
        public selectedColumn?: string,
        public orderColumn?: string
    ) {}
}
