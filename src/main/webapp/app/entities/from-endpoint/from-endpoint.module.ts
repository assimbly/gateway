import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GatewaySharedModule } from 'app/shared';
import {
    FromEndpointComponent,
    FromEndpointDetailComponent,
    FromEndpointUpdateComponent,
    FromEndpointDeletePopupComponent,
    FromEndpointDeleteDialogComponent,
    fromEndpointRoute,
    fromEndpointPopupRoute
} from './';

const ENTITY_STATES = [...fromEndpointRoute, ...fromEndpointPopupRoute];

@NgModule({
    imports: [GatewaySharedModule, RouterModule.forChild(ENTITY_STATES)],
    declarations: [
        FromEndpointComponent,
        FromEndpointDetailComponent,
        FromEndpointUpdateComponent,
        FromEndpointDeleteDialogComponent,
        FromEndpointDeletePopupComponent
    ],
    entryComponents: [
        FromEndpointComponent,
        FromEndpointUpdateComponent,
        FromEndpointDeleteDialogComponent,
        FromEndpointDeletePopupComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayFromEndpointModule {}
