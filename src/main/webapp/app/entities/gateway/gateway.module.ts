import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PopoverModule } from 'ngx-bootstrap';
import { Components } from 'app/shared/camel/component-type';
import { GatewaySharedModule } from "app/shared";

import {
    GatewayComponent,
    GatewayService,
    GatewayDetailComponent,
    GatewayUpdateComponent,
    GatewayDeletePopupComponent,
    GatewayDeleteDialogComponent,
    GatewayImportPopupComponent,
    GatewayImportDialogComponent,
    gatewayRoute,
    gatewayPopupRoute
} from './';

const ENTITY_STATES = [...gatewayRoute, ...gatewayPopupRoute];

@NgModule({
    imports: [
        GatewaySharedModule,
        RouterModule.forChild(ENTITY_STATES),
        PopoverModule.forRoot(),
    ],
    declarations: [
        GatewayComponent,
        GatewayDetailComponent,
        GatewayUpdateComponent,
        GatewayDeleteDialogComponent,
        GatewayDeletePopupComponent,
        GatewayImportPopupComponent,
        GatewayImportDialogComponent
    ],
    entryComponents: [
        GatewayComponent,
        GatewayDeleteDialogComponent,
        GatewayDeletePopupComponent,
        GatewayImportPopupComponent,
        GatewayImportDialogComponent
    ],
    providers: [
        Components,
        GatewayService
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayGatewayModule { }
