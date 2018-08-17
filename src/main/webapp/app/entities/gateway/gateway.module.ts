import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { PopoverModule } from 'ngx-bootstrap';

import { GatewaySharedModule } from '../../shared';
import { Components } from '../../shared/camel/component-type';

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
        RouterModule.forChild(ENTITY_STATES),
        PopoverModule.forRoot(),
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
        Components,
        GatewayService,
        GatewayPopupService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayGatewayModule { }
