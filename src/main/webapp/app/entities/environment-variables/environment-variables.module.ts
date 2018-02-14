import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GatewaySharedModule } from '../../shared';
import {
    EnvironmentVariablesService,
    EnvironmentVariablesPopupService,
    EnvironmentVariablesComponent,
    EnvironmentVariablesDetailComponent,
    EnvironmentVariablesDialogComponent,
    EnvironmentVariablesPopupComponent,
    EnvironmentVariablesDeletePopupComponent,
    EnvironmentVariablesDeleteDialogComponent,
    environmentVariablesRoute,
    environmentVariablesPopupRoute,
} from './';

const ENTITY_STATES = [
    ...environmentVariablesRoute,
    ...environmentVariablesPopupRoute,
];

@NgModule({
    imports: [
        GatewaySharedModule,
        RouterModule.forChild(ENTITY_STATES)
    ],
    declarations: [
        EnvironmentVariablesComponent,
        EnvironmentVariablesDetailComponent,
        EnvironmentVariablesDialogComponent,
        EnvironmentVariablesDeleteDialogComponent,
        EnvironmentVariablesPopupComponent,
        EnvironmentVariablesDeletePopupComponent,
    ],
    entryComponents: [
        EnvironmentVariablesComponent,
        EnvironmentVariablesDialogComponent,
        EnvironmentVariablesPopupComponent,
        EnvironmentVariablesDeleteDialogComponent,
        EnvironmentVariablesDeletePopupComponent,
    ],
    providers: [
        EnvironmentVariablesService,
        EnvironmentVariablesPopupService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayEnvironmentVariablesModule {}
