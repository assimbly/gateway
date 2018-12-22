import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GatewaySharedModule } from 'app/shared';
import {
    ToEndpointComponent,
    ToEndpointDetailComponent,
    ToEndpointUpdateComponent,
    ToEndpointDeletePopupComponent,
    ToEndpointDeleteDialogComponent,
    toEndpointRoute,
    toEndpointPopupRoute
} from './';

const ENTITY_STATES = [...toEndpointRoute, ...toEndpointPopupRoute];

@NgModule({
    imports: [GatewaySharedModule, RouterModule.forChild(ENTITY_STATES)],
    declarations: [
        ToEndpointComponent,
        ToEndpointDetailComponent,
        ToEndpointUpdateComponent,
        ToEndpointDeleteDialogComponent,
        ToEndpointDeletePopupComponent
    ],
    entryComponents: [ToEndpointComponent, ToEndpointUpdateComponent, ToEndpointDeleteDialogComponent, ToEndpointDeletePopupComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayToEndpointModule {}
