import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AlertService } from 'app/core/util/alert.service';
import { IServiceKeys } from 'app/shared/model/service-keys.model';
import { ServiceKeysService } from './service-keys.service';
import { IService } from 'app/shared/model/service.model';
import { ServiceService } from 'app/entities/service/service.service';

@Component({
    selector: 'jhi-service-keys-update',
    templateUrl: './service-keys-update.component.html'
})
export class ServiceKeysUpdateComponent implements OnInit {
    serviceKeys: IServiceKeys;
    isSaving: boolean;

    services: IService[];

    constructor(
		protected alertService: AlertService,
        protected serviceKeysService: ServiceKeysService,
        protected serviceService: ServiceService,
        protected activatedRoute: ActivatedRoute
    ) {}

    ngOnInit() {
        this.isSaving = false;
        this.activatedRoute.data.subscribe(({ serviceKeys }) => {
            this.serviceKeys = serviceKeys;
        });
        this.serviceService.query().subscribe(
            (res: HttpResponse<IService[]>) => {
                this.services = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    previousState() {
        window.history.back();
    }

    save() {
        this.isSaving = true;
        if (this.serviceKeys.id !== undefined) {
            this.subscribeToSaveResponse(this.serviceKeysService.update(this.serviceKeys));
        } else {
            this.subscribeToSaveResponse(this.serviceKeysService.create(this.serviceKeys));
        }
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<IServiceKeys>>) {
        result.subscribe(
            (res: HttpResponse<IServiceKeys>) => this.onSaveSuccess(),
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
		this.alertService.addAlert({
		  type: 'danger',
		  message: errorMessage,
		});
    }

    trackServiceById(index: number, item: IService) {
        return item.id;
    }
}
