import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GatewaySharedModule } from 'app/shared';
import {
    WireTapEndpointComponent,
    WireTapEndpointDetailComponent,
    WireTapEndpointUpdateComponent,
    WireTapEndpointDeletePopupComponent,
    WireTapEndpointDeleteDialogComponent,
    wireTapEndpointRoute,
    wireTapEndpointPopupRoute
} from './';

const ENTITY_STATES = [...wireTapEndpointRoute, ...wireTapEndpointPopupRoute];

@NgModule({
    imports: [GatewaySharedModule, RouterModule.forChild(ENTITY_STATES)],
    declarations: [
        WireTapEndpointComponent,
        WireTapEndpointDetailComponent,
        WireTapEndpointUpdateComponent,
        WireTapEndpointDeleteDialogComponent,
        WireTapEndpointDeletePopupComponent
    ],
    entryComponents: [
        WireTapEndpointComponent,
        WireTapEndpointUpdateComponent,
        WireTapEndpointDeleteDialogComponent,
        WireTapEndpointDeletePopupComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayWireTapEndpointModule {}
