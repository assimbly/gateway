import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GatewaySharedModule } from '../../shared';
import {
    GatewayService,
    GatewayPopupService,
    GatewayComponent,
    GatewayDetailComponent,
    GatewayDialogComponent,
    GatewayPopupComponent,
    GatewayDeletePopupComponent,
    GatewayDeleteDialogComponent,
    GatewayImportPopupComponent,
    GatewayImportDialogComponent,
    gatewayRoute,
    gatewayPopupRoute,
} from './';

const ENTITY_STATES = [
    ...gatewayRoute,
    ...gatewayPopupRoute,
];

@NgModule({
    imports: [
        GatewaySharedModule,
        RouterModule.forChild(ENTITY_STATES)
    ],
    declarations: [
        GatewayComponent,
        GatewayDetailComponent,
        GatewayDialogComponent,
        GatewayDeleteDialogComponent,
        GatewayPopupComponent,
        GatewayDeletePopupComponent,
        GatewayImportPopupComponent,
        GatewayImportDialogComponent
    ],
    entryComponents: [
        GatewayComponent,
        GatewayDialogComponent,
        GatewayPopupComponent,
        GatewayDeleteDialogComponent,
        GatewayDeletePopupComponent,
        GatewayImportPopupComponent,
        GatewayImportDialogComponent
    ],
    providers: [
        GatewayService,
        GatewayPopupService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayGatewayModule {}
