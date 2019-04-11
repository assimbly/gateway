import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { DATE_TIME_FORMAT } from 'app/shared/constants/input.constants';

import { ISecurity } from 'app/shared/model/security.model';
import { SecurityService } from './security.service';

@Component({
    selector: 'jhi-security-update',
    templateUrl: './security-update.component.html'
})
export class SecurityUpdateComponent implements OnInit {
    security: ISecurity;
    isSaving: boolean;
    certificateExpiry: string;

    constructor(protected securityService: SecurityService, protected activatedRoute: ActivatedRoute) {}

    ngOnInit() {
        this.isSaving = false;
        this.activatedRoute.data.subscribe(({ security }) => {
            this.security = security;
            this.certificateExpiry =
                this.security.certificateExpiry != null ? this.security.certificateExpiry.format(DATE_TIME_FORMAT) : null;
        });
    }

    previousState() {
        window.history.back();
    }

    save() {
        this.isSaving = true;
        this.security.certificateExpiry = this.certificateExpiry != null ? moment(this.certificateExpiry, DATE_TIME_FORMAT) : null;
        if (this.security.id !== undefined) {
            this.subscribeToSaveResponse(this.securityService.update(this.security));
        } else {
            this.subscribeToSaveResponse(this.securityService.create(this.security));
        }
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<ISecurity>>) {
        result.subscribe((res: HttpResponse<ISecurity>) => this.onSaveSuccess(), (res: HttpErrorResponse) => this.onSaveError());
    }

    protected onSaveSuccess() {
        this.isSaving = false;
        this.previousState();
    }

    protected onSaveError() {
        this.isSaving = false;
    }
}
