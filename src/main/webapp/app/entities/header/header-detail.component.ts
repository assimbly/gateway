import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IHeader } from 'app/shared/model/header.model';

@Component({
    selector: 'jhi-header-detail',
    templateUrl: './header-detail.component.html'
})
export class HeaderDetailComponent implements OnInit {
    header: IHeader;

    constructor(protected activatedRoute: ActivatedRoute) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ header }) => {
            this.header = header;
        });
    }

    previousState() {
        window.history.back();
    }
}
