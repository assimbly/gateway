import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import SharedModule from 'app/shared/shared.module';

import { Components } from '../../shared/camel/component-type';

import { StepComponent } from './step.component';
import { StepDetailComponent } from './step-detail.component';
import { StepUpdateComponent } from './step-update.component';

import { StepDeleteDialogComponent } from './step-delete-dialog.component';

import { stepRoute } from './step.route';

const ENTITY_STATES = [...stepRoute];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(ENTITY_STATES), NgSelectModule, FormsModule, ReactiveFormsModule],
  exports: [StepComponent],
  declarations: [
    StepComponent,
    StepDetailComponent,
    StepUpdateComponent,
    StepDeleteDialogComponent,
  ],
  providers: [Components],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class StepModule {}
