import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IStep } from 'app/shared/model/step.model';

@Component({
    selector: 'jhi-step-detail',
    templateUrl: './step-detail.component.html'
})
export class StepDetailComponent implements OnInit {
    step: IStep;

    constructor(protected activatedRoute: ActivatedRoute) {}

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ step }) => {
            this.step = step;
        });
    }

    previousState() {
        window.history.back();
    }
}
