import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { GatewaySharedModule } from 'app/shared/shared.module';
import { GatewayServiceKeysModule } from '../../entities/service-keys/service-keys.module';

import { Services } from 'app/shared/camel/service-connections';

import {
    ServiceComponent,
    ServiceDetailComponent,
    ServiceUpdateComponent,
    ServiceDeletePopupComponent,
    ServiceDeleteDialogComponent,
    ServiceDialogComponent,
    ServiceAllComponent,
    serviceRoute,
    servicePopupRoute,
    ForbiddenServiceNamesValidatorDirective,
    ForbiddenServiceKeysValidatorDirective
} from './';
import { NgSelectModule } from '@ng-select/ng-select';
import { ServiceService } from 'app/entities/service/service.service';
import { ServicePopupService } from 'app/entities/service/service-popup.service';
import { ServicePopupComponent } from 'app/entities/service/service-dialog.component';

const ENTITY_STATES = [...serviceRoute, ...servicePopupRoute];

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
        ServiceDialogComponent,
        ServiceDeleteDialogComponent,
        ServiceDeletePopupComponent,
        ServicePopupComponent,
        ForbiddenServiceNamesValidatorDirective,
        ForbiddenServiceKeysValidatorDirective
    ],
    entryComponents: [
        ServiceComponent,
        ServiceAllComponent,
        ServiceUpdateComponent,
        ServiceDeleteDialogComponent,
        ServiceDialogComponent,
        ServiceDeletePopupComponent,
        ServicePopupComponent
    ],
    providers: [ServiceService, ServicePopupService],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayServiceModule {}
