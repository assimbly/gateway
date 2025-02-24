import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AlertService } from 'app/core/util/alert.service';
import { ILink } from 'app/shared/model/link.model';
import { LinkService } from './link.service';
import { IStep } from 'app/shared/model/step.model';
import { StepService } from 'app/entities/step/step.service';

@Component({
    standalone: false,
    selector: 'jhi-link-update',
    templateUrl: './link-update.component.html'
})
export class LinkUpdateComponent implements OnInit {
    link: ILink;
    isSaving: boolean;

    steps: IStep[];

    constructor(
		protected alertService: AlertService,
        protected linkService: LinkService,
        protected stepService: StepService,
        protected activatedRoute: ActivatedRoute
    ) {}

    ngOnInit() {
        this.isSaving = false;
        this.activatedRoute.data.subscribe(({ link }) => {
            this.link = link;
        });
        this.stepService.query().subscribe(
            (res: HttpResponse<IStep[]>) => {
                this.steps = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    previousState() {
        window.history.back();
    }

    save() {
        this.isSaving = true;
        if (this.link.id !== undefined) {
            this.subscribeToSaveResponse(this.linkService.update(this.link));
        } else {
            this.subscribeToSaveResponse(this.linkService.create(this.link));
        }
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<ILink>>) {
        result.subscribe(
            (res: HttpResponse<ILink>) => this.onSaveSuccess(),
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

    trackStepById(index: number, item: IStep) {
        return item.id;
    }
}
