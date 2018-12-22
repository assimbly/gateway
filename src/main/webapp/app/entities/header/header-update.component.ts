import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { IHeader } from 'app/shared/model/header.model';
import { HeaderService } from './header.service';

@Component({
    selector: 'jhi-header-update',
    templateUrl: './header-update.component.html'
})
export class HeaderUpdateComponent implements OnInit {
    header: IHeader;
    isSaving: boolean;

    constructor(protected headerService: HeaderService, protected activatedRoute: ActivatedRoute) {}

    ngOnInit() {
        this.isSaving = false;
        this.activatedRoute.data.subscribe(({ header }) => {
            this.header = header;
        });
    }

    previousState() {
        window.history.back();
    }

    save() {
        this.isSaving = true;
        if (this.header.id !== undefined) {
            this.subscribeToSaveResponse(this.headerService.update(this.header));
        } else {
            this.subscribeToSaveResponse(this.headerService.create(this.header));
        }
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<IHeader>>) {
        result.subscribe((res: HttpResponse<IHeader>) => this.onSaveSuccess(), (res: HttpErrorResponse) => this.onSaveError());
    }

    protected onSaveSuccess() {
        this.isSaving = false;
        this.previousState();
    }

    protected onSaveError() {
        this.isSaving = false;
    }
}
