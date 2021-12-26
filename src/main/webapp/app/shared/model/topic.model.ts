export interface ITopic {
    id?: number;
    itemsOnPage?: number;
    refreshInterval?: number;
    selectedColumn?: string;
    orderColumn?: string;
}

export class Topic implements ITopic {
    constructor(
        public id?: number,
        public itemsOnPage?: number,
        public refreshInterval?: number,
        public selectedColumn?: string,
        public orderColumn?: string
    ) {}
}
