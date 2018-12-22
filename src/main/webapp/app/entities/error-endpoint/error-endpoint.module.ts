import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GatewaySharedModule } from '../../shared';
import {
    ErrorEndpointService,
    ErrorEndpointPopupService,
    ErrorEndpointComponent,
    ErrorEndpointDetailComponent,
    ErrorEndpointDialogComponent,
    ErrorEndpointPopupComponent,
    ErrorEndpointDeletePopupComponent,
    ErrorEndpointDeleteDialogComponent,
    errorEndpointRoute,
    errorEndpointPopupRoute,
} from './';

const ENTITY_STATES = [
    ...errorEndpointRoute,
    ...errorEndpointPopupRoute,
];

@NgModule({
    imports: [
        GatewaySharedModule,
        RouterModule.forChild(ENTITY_STATES)
    ],
    declarations: [
        ErrorEndpointComponent,
        ErrorEndpointDetailComponent,
        ErrorEndpointDialogComponent,
        ErrorEndpointDeleteDialogComponent,
        ErrorEndpointPopupComponent,
        ErrorEndpointDeletePopupComponent,
    ],
    entryComponents: [
        ErrorEndpointComponent,
        ErrorEndpointDialogComponent,
        ErrorEndpointPopupComponent,
        ErrorEndpointDeleteDialogComponent,
        ErrorEndpointDeletePopupComponent,
    ],
    providers: [
        ErrorEndpointService,
        ErrorEndpointPopupService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayErrorEndpointModule {}
