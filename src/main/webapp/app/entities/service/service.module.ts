import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GatewayServiceKeysModule } from '../../entities/service-keys/service-keys.module';
import { GatewaySharedModule } from '../../shared';
import {
    ServiceService,
    ServicePopupService,
    ServiceComponent,
    ServiceDetailComponent,
    ServiceDialogComponent,
    ServicePopupComponent,
    ServiceDeletePopupComponent,
    ServiceDeleteDialogComponent,
    serviceRoute,
    servicePopupRoute,
} from './';

const ENTITY_STATES = [
    ...serviceRoute,
    ...servicePopupRoute,
];

@NgModule({
    imports: [
        GatewaySharedModule,
        GatewayServiceKeysModule,
        RouterModule.forChild(ENTITY_STATES)
    ],
    declarations: [
        ServiceComponent,
        ServiceDetailComponent,
        ServiceDialogComponent,
        ServiceDeleteDialogComponent,
        ServicePopupComponent,
        ServiceDeletePopupComponent,
    ],
    entryComponents: [
        ServiceComponent,
        ServiceDialogComponent,
        ServicePopupComponent,
        ServiceDeleteDialogComponent,
        ServiceDeletePopupComponent,
    ],
    providers: [
        ServiceService,
        ServicePopupService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayServiceModule { }
