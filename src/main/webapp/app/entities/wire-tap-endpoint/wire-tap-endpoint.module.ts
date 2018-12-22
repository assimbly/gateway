import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GatewaySharedModule } from '../../shared';
import {
    WireTapEndpointService,
    WireTapEndpointPopupService,
    WireTapEndpointComponent,
    WireTapEndpointDetailComponent,
    WireTapEndpointDialogComponent,
    WireTapEndpointPopupComponent,
    WireTapEndpointDeletePopupComponent,
    WireTapEndpointDeleteDialogComponent,
    wireTapEndpointRoute,
    wireTapEndpointPopupRoute,
} from './';

const ENTITY_STATES = [
    ...wireTapEndpointRoute,
    ...wireTapEndpointPopupRoute,
];

@NgModule({
    imports: [
        GatewaySharedModule,
        RouterModule.forChild(ENTITY_STATES)
    ],
    declarations: [
        WireTapEndpointComponent,
        WireTapEndpointDetailComponent,
        WireTapEndpointDialogComponent,
        WireTapEndpointDeleteDialogComponent,
        WireTapEndpointPopupComponent,
        WireTapEndpointDeletePopupComponent,
    ],
    entryComponents: [
        WireTapEndpointComponent,
        WireTapEndpointDialogComponent,
        WireTapEndpointPopupComponent,
        WireTapEndpointDeleteDialogComponent,
        WireTapEndpointDeletePopupComponent,
    ],
    providers: [
        WireTapEndpointService,
        WireTapEndpointPopupService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayWireTapEndpointModule {}
