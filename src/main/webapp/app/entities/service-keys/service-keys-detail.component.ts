import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IServiceKeys } from 'app/shared/model/service-keys.model';

@Component({
    selector: 'jhi-service-keys-detail',
    templateUrl: './service-keys-detail.component.html'
})
export class ServiceKeysDetailComponent implements OnInit {
    serviceKeys: IServiceKeys;

    constructor(protected activatedRoute: ActivatedRoute) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ serviceKeys }) => {
            this.serviceKeys = serviceKeys;
        });
    }

    previousState() {
        window.history.back();
    }
}
