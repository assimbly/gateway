import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import SharedModule from 'app/shared/shared.module';
import { SortDirective, SortByDirective } from 'app/shared/sort';

import { EnvironmentVariablesComponent } from './environment-variables.component';
import { EnvironmentVariablesDetailComponent } from './environment-variables-detail.component';
import { EnvironmentVariablesUpdateComponent } from './environment-variables-update.component';
import { EnvironmentVariablesDialogComponent } from './environment-variables-dialog.component';
import { EnvironmentVariablesDeleteDialogComponent } from './environment-variables-delete-dialog.component';
import { environmentVariablesRoute } from './environment-variables.route';

const ENTITY_STATES = [...environmentVariablesRoute];

@NgModule({
  imports: [ReactiveFormsModule, SharedModule, SortDirective, SortByDirective, RouterModule.forChild(ENTITY_STATES)],
  declarations: [
    EnvironmentVariablesComponent,
    EnvironmentVariablesDetailComponent,
    EnvironmentVariablesUpdateComponent,
    EnvironmentVariablesDialogComponent,
    EnvironmentVariablesDeleteDialogComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EnvironmentVariablesModule {}
