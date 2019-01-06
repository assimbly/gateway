import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IHeaderKeys } from 'app/shared/model/header-keys.model';

@Component({
    selector: 'jhi-header-keys-detail',
    templateUrl: './header-keys-detail.component.html'
})
export class HeaderKeysDetailComponent implements OnInit {
    headerKeys: IHeaderKeys;

    constructor(protected activatedRoute: ActivatedRoute) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ headerKeys }) => {
            this.headerKeys = headerKeys;
        });
    }

    previousState() {
        window.history.back();
    }
}
