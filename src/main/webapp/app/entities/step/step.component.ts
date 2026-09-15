import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { AlertService } from 'app/core/util/alert.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IStep } from 'app/shared/model/step.model';
import { AccountService } from 'app/core/auth/account.service';
import { StepService } from './step.service';

@Component({
  selector: 'jhi-step',
  templateUrl: './step.component.html',
  imports: [CommonModule, RouterModule, FontAwesomeModule],
})
export class StepComponent implements OnInit, OnDestroy {
    steps: IStep[];
    currentAccount: any;
    eventSubscriber: Subscription;

    constructor(
        protected stepService: StepService,
        protected alertService: AlertService,
        protected eventManager: EventManager,
        protected accountService: AccountService
    ) {}

    loadAll() {
        this.stepService.query().subscribe(
            (res: HttpResponse<IStep[]>) => {
                this.steps = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    ngOnInit() {
        this.loadAll();
        this.accountService.identity().subscribe(account => {
            this.currentAccount = account;
        });
        this.registerChangeInSteps();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: IStep) {
        return item.id;
    }

    registerChangeInSteps() {
        this.eventSubscriber = this.eventManager.subscribe('stepListModification', response => this.loadAll());
    }

    protected onError(errorMessage: string) {
		this.alertService.addAlert({
		  type: 'danger',
		  message: errorMessage,
		});
    }
}
