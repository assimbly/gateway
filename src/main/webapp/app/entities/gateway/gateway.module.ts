import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PopoverModule } from 'ngx-bootstrap';
import { Components } from 'app/shared/camel/component-type';
import { GatewaySharedModule } from 'app/shared';

import {
    GatewayComponent,
    GatewayService,
    GatewayDetailComponent,
    GatewayUpdateComponent,
    GatewayDeletePopupComponent,
    GatewayDeleteDialogComponent,
    GatewayImportPopupComponent,
    GatewayImportDialogComponent,
    GatewayExportPopupComponent,
    GatewayExportDialogComponent,
    gatewayRoute,
    gatewayPopupRoute,
    GatewayPopupService
} from './';

const ENTITY_STATES = [...gatewayRoute, ...gatewayPopupRoute];

@NgModule({
    imports: [GatewaySharedModule, PopoverModule.forRoot(), RouterModule.forChild(ENTITY_STATES)],
    declarations: [
        GatewayComponent,
        GatewayDetailComponent,
        GatewayUpdateComponent,
        GatewayDeleteDialogComponent,
        GatewayDeletePopupComponent,
        GatewayImportPopupComponent,
        GatewayImportDialogComponent,
        GatewayExportPopupComponent,
        GatewayExportDialogComponent
    ],
    entryComponents: [
        GatewayComponent,
        GatewayUpdateComponent,
        GatewayDeleteDialogComponent,
        GatewayDeletePopupComponent,
        GatewayImportPopupComponent,
        GatewayImportDialogComponent,
        GatewayExportPopupComponent,
        GatewayExportDialogComponent
    ],
    providers: [Components, GatewayService, GatewayPopupService],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayGatewayModule {}
