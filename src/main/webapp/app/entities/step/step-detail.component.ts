import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertError } from 'app/shared/alert';

import { IStep } from 'app/shared/model/step.model';

@Component({
  selector: 'jhi-step-detail',
  templateUrl: './step-detail.component.html',
  imports: [CommonModule, RouterModule, FontAwesomeModule, AlertError],
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
