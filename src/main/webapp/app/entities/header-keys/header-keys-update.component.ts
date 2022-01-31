import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JhiAlertService } from 'ng-jhipster';

import { IHeaderKeys } from 'app/shared/model/header-keys.model';
import { HeaderKeysService } from './header-keys.service';
import { IHeader } from 'app/shared/model/header.model';
import { HeaderService } from 'app/entities/header/header.service';

@Component({
    selector: 'jhi-header-keys-update',
    templateUrl: './header-keys-update.component.html'
})
export class HeaderKeysUpdateComponent implements OnInit {
    headerKeys: IHeaderKeys;
    isSaving: boolean;

    headers: IHeader[];

    constructor(
        protected jhiAlertService: JhiAlertService,
        protected headerKeysService: HeaderKeysService,
        protected headerService: HeaderService,
        protected activatedRoute: ActivatedRoute
    ) {}

    ngOnInit() {
        this.isSaving = false;
        this.activatedRoute.data.subscribe(({ headerKeys }) => {
            this.headerKeys = headerKeys;
        });
        this.headerService.query().subscribe(
            (res: HttpResponse<IHeader[]>) => {
                this.headers = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    previousState() {
        window.history.back();
    }

    save() {
        this.isSaving = true;
        if (this.headerKeys.id !== undefined) {
            this.subscribeToSaveResponse(this.headerKeysService.update(this.headerKeys));
        } else {
            this.subscribeToSaveResponse(this.headerKeysService.create(this.headerKeys));
        }
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<IHeaderKeys>>) {
        result.subscribe(
            (res: HttpResponse<IHeaderKeys>) => this.onSaveSuccess(),
            (res: HttpErrorResponse) => this.onSaveError()
        );
    }

    protected onSaveSuccess() {
        this.isSaving = false;
        this.previousState();
    }

    protected onSaveError() {
        this.isSaving = false;
    }

    protected onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }

    trackHeaderById(index: number, item: IHeader) {
        return item.id;
    }
}
