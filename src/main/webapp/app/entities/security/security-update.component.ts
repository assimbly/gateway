import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { DATE_TIME_FORMAT } from 'app/shared/constants/input.constants';

import { ISecurity } from 'app/shared/model/security.model';
import { SecurityService } from './security.service';

//import { faSync } from '@fortawesome/free-solid-svg-icons';

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

    add() {
        this.isSaving = true;
        
        this.security.certificateExpiry = this.certificateExpiry != null ? moment(this.certificateExpiry, DATE_TIME_FORMAT) : null;
        if (this.security.id !== undefined) {
            this.subscribeToAddResponse(this.securityService.update(this.security));
        } else {
            this.subscribeToAddResponse(this.securityService.create(this.security));
        }
    }

    remove() {
        this.isSaving = true;        
        this.security.certificateExpiry = this.certificateExpiry != null ? moment(this.certificateExpiry, DATE_TIME_FORMAT) : null;
        this.subscribeToRemoveResponse(this.securityService.remove(this.security.url));
    }
    
    renew() {
        this.isSaving = true;
        this.security.certificateExpiry = this.certificateExpiry != null ? moment(this.certificateExpiry, DATE_TIME_FORMAT) : null;
        this.securityService.remove(this.security.url).subscribe((res: HttpResponse<ISecurity>) => this.subscribeToAddResponse(this.securityService.create(this.security)), (res: HttpErrorResponse) => this.onSaveError());
    }    
    
    protected subscribeToAddResponse(result: Observable<HttpResponse<ISecurity>>) {
        result.subscribe((res: HttpResponse<ISecurity>) => this.onSaveSuccess(), (res: HttpErrorResponse) => this.onSaveError());
    }

    protected subscribeToRemoveResponse(result: Observable<HttpResponse<ISecurity>>) {
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
