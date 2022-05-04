import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AlertService } from 'app/core/util/alert.service';
import { IEndpoint } from 'app/shared/model/endpoint.model';
import { EndpointService } from './endpoint.service';
import { IFlow } from 'app/shared/model/flow.model';
import { FlowService } from 'app/entities/flow/flow.service';
import { IService } from 'app/shared/model/service.model';
import { ServiceService } from 'app/entities/service/service.service';
import { IHeader } from 'app/shared/model/header.model';
import { HeaderService } from 'app/entities/header/header.service';

@Component({
    selector: 'jhi-endpoint-update',
    templateUrl: './endpoint-update.component.html'
})
export class EndpointUpdateComponent implements OnInit {
    endpoint: IEndpoint;
    isSaving: boolean;

    flows: IFlow[];

    services: IService[];

    headers: IHeader[];

    constructor(
        protected alertService: AlertService,
        protected endpointService: EndpointService,
        protected flowService: FlowService,
        protected serviceService: ServiceService,
        protected headerService: HeaderService,
        protected activatedRoute: ActivatedRoute
    ) {}

    ngOnInit() {
        this.isSaving = false;
        this.activatedRoute.data.subscribe(({ endpoint }) => {
            this.endpoint = endpoint;
        });
        this.flowService.query().subscribe(
            (res: HttpResponse<IFlow[]>) => {
                this.flows = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
        this.serviceService.query({ filter: 'endpoint-is-null' }).subscribe(
            (res: HttpResponse<IService[]>) => {
                if (!this.endpoint.serviceId) {
                    this.services = res.body;
                } else {
                    this.serviceService.find(this.endpoint.serviceId).subscribe(
                        (subRes: HttpResponse<IService>) => {
                            this.services = [subRes.body].concat(res.body);
                        },
                        (subRes: HttpErrorResponse) => this.onError(subRes.message)
                    );
                }
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
        this.headerService.query({ filter: 'endpoint-is-null' }).subscribe(
            (res: HttpResponse<IHeader[]>) => {
                if (!this.endpoint.headerId) {
                    this.headers = res.body;
                } else {
                    this.headerService.find(this.endpoint.headerId).subscribe(
                        (subRes: HttpResponse<IHeader>) => {
                            this.headers = [subRes.body].concat(res.body);
                        },
                        (subRes: HttpErrorResponse) => this.onError(subRes.message)
                    );
                }
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    previousState() {
        window.history.back();
    }

    save() {
        this.isSaving = true;
        if (this.endpoint.id !== undefined) {
            this.subscribeToSaveResponse(this.endpointService.update(this.endpoint));
        } else {
            this.subscribeToSaveResponse(this.endpointService.create(this.endpoint));
        }
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<IEndpoint>>) {
        result.subscribe(
            (res: HttpResponse<IEndpoint>) => this.onSaveSuccess(),
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

    trackFlowById(index: number, item: IFlow) {
        return item.id;
    }

    trackServiceById(index: number, item: IService) {
        return item.id;
    }

    trackHeaderById(index: number, item: IHeader) {
        return item.id;
    }
}
