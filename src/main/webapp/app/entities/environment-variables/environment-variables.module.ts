import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { GatewaySharedModule } from 'app/shared/shared.module';

import { EnvironmentVariablesComponent } from './environment-variables.component';
import { EnvironmentVariablesDetailComponent } from './environment-variables-detail.component';
import { EnvironmentVariablesUpdateComponent } from './environment-variables-update.component';
import { EnvironmentVariablesDialogComponent } from './environment-variables-dialog.component';
import { EnvironmentVariablesDeletePopupComponent } from './environment-variables-delete-dialog.component';
import { EnvironmentVariablesDeleteDialogComponent } from './environment-variables-delete-dialog.component';
import { environmentVariablesRoute } from './environment-variables.route';
import { environmentVariablesPopupRoute } from './environment-variables.route';

const ENTITY_STATES = [...environmentVariablesRoute, ...environmentVariablesPopupRoute];

@NgModule({
    imports: [ReactiveFormsModule, GatewaySharedModule, RouterModule.forChild(ENTITY_STATES)],
    declarations: [
        EnvironmentVariablesComponent,
        EnvironmentVariablesDetailComponent,
        EnvironmentVariablesUpdateComponent,
        EnvironmentVariablesDialogComponent,
        EnvironmentVariablesDeleteDialogComponent,
        EnvironmentVariablesDeletePopupComponent
    ],
    entryComponents: [
        EnvironmentVariablesComponent,
        EnvironmentVariablesUpdateComponent,
        EnvironmentVariablesDialogComponent,
        EnvironmentVariablesDeleteDialogComponent,
        EnvironmentVariablesDeletePopupComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayEnvironmentVariablesModule {}
