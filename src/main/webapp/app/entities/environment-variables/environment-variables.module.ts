import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { GatewaySharedModule } from 'app/shared';
import {
    EnvironmentVariablesComponent,
    EnvironmentVariablesDetailComponent,
    EnvironmentVariablesUpdateComponent,
    EnvironmentVariablesDialogComponent,
    EnvironmentVariablesDeletePopupComponent,
    EnvironmentVariablesDeleteDialogComponent,
    environmentVariablesRoute,
    environmentVariablesPopupRoute
} from './';

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
