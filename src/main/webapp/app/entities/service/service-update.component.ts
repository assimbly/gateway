import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { IService } from 'app/shared/model/service.model';
import { ServiceService } from './service.service';

@Component({
    selector: 'jhi-service-update',
    templateUrl: './service-update.component.html'
})
export class ServiceUpdateComponent implements OnInit {
    service: IService;
    isSaving: boolean;

    constructor(protected serviceService: ServiceService, protected activatedRoute: ActivatedRoute) {}

    ngOnInit() {
        this.isSaving = false;
        this.activatedRoute.data.subscribe(({ service }) => {
            this.service = service;
        });
    }

    previousState() {
        window.history.back();
    }

    save() {
        this.isSaving = true;
        if (this.service.id !== undefined) {
            this.subscribeToSaveResponse(this.serviceService.update(this.service));
        } else {
            this.subscribeToSaveResponse(this.serviceService.create(this.service));
        }
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<IService>>) {
        result.subscribe((res: HttpResponse<IService>) => this.onSaveSuccess(), (res: HttpErrorResponse) => this.onSaveError());
    }

    protected onSaveSuccess() {
        this.isSaving = false;
        this.previousState();
    }

    protected onSaveError() {
        this.isSaving = false;
    }
}
