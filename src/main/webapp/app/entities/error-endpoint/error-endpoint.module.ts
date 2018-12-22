import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GatewaySharedModule } from 'app/shared';
import {
    ErrorEndpointComponent,
    ErrorEndpointDetailComponent,
    ErrorEndpointUpdateComponent,
    ErrorEndpointDeletePopupComponent,
    ErrorEndpointDeleteDialogComponent,
    errorEndpointRoute,
    errorEndpointPopupRoute
} from './';

const ENTITY_STATES = [...errorEndpointRoute, ...errorEndpointPopupRoute];

@NgModule({
    imports: [GatewaySharedModule, RouterModule.forChild(ENTITY_STATES)],
    declarations: [
        ErrorEndpointComponent,
        ErrorEndpointDetailComponent,
        ErrorEndpointUpdateComponent,
        ErrorEndpointDeleteDialogComponent,
        ErrorEndpointDeletePopupComponent
    ],
    entryComponents: [
        ErrorEndpointComponent,
        ErrorEndpointUpdateComponent,
        ErrorEndpointDeleteDialogComponent,
        ErrorEndpointDeletePopupComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayErrorEndpointModule {}
