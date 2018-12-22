import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GatewayServiceKeysModule } from '../../entities/service-keys/service-keys.module';
import { GatewaySharedModule } from '../../shared';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    ServiceComponent,
    ServiceDetailComponent,
    ServiceUpdateComponent,
    ServiceDeletePopupComponent,
    ServiceDeleteDialogComponent,
    ServiceAllComponent,
    serviceRoute,
    servicePopupRoute,
    ForbiddenServiceNamesValidatorDirective,
    ForbiddenServiceKeysValidatorDirective
} from './';
import { NgSelectModule } from '@ng-select/ng-select';
const ENTITY_STATES = [
    ...serviceRoute,
    ...servicePopupRoute,
];

@NgModule({
    imports: [
        GatewaySharedModule,
        GatewayServiceKeysModule,
        NgSelectModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(ENTITY_STATES)
    ],
    declarations: [
        ServiceComponent,
        ServiceAllComponent,
        ServiceDetailComponent,
        ServiceUpdateComponent,
        ServiceDeleteDialogComponent,
        ServicePopupComponent,
        ServiceDeletePopupComponent,
        ForbiddenServiceNamesValidatorDirective,
        ForbiddenServiceKeysValidatorDirective
    ],
    entryComponents: [
        ServiceComponent,
        ServiceAllComponent,
        ServiceDialogComponent,
        ServicePopupComponent,
        ServiceDeleteDialogComponent,
        ServiceDeletePopupComponent,
    ],
    providers: [
        ServiceService,
        ServicePopupService,
    ],
    entryComponents: [ServiceComponent, ServiceUpdateComponent, ServiceDeleteDialogComponent, ServiceDeletePopupComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayServiceModule { }
