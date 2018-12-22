import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GatewaySharedModule } from 'app/shared';
import {
    EnvironmentVariablesComponent,
    EnvironmentVariablesDetailComponent,
    EnvironmentVariablesUpdateComponent,
    EnvironmentVariablesDeletePopupComponent,
    EnvironmentVariablesDeleteDialogComponent,
    environmentVariablesRoute,
    environmentVariablesPopupRoute
} from './';

const ENTITY_STATES = [...environmentVariablesRoute, ...environmentVariablesPopupRoute];

@NgModule({
    imports: [GatewaySharedModule, RouterModule.forChild(ENTITY_STATES)],
    declarations: [
        EnvironmentVariablesComponent,
        EnvironmentVariablesDetailComponent,
        EnvironmentVariablesUpdateComponent,
        EnvironmentVariablesDeleteDialogComponent,
        EnvironmentVariablesDeletePopupComponent
    ],
    entryComponents: [
        EnvironmentVariablesComponent,
        EnvironmentVariablesUpdateComponent,
        EnvironmentVariablesDeleteDialogComponent,
        EnvironmentVariablesDeletePopupComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayEnvironmentVariablesModule {}
