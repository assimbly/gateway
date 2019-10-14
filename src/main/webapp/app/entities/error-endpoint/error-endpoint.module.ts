import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { GatewaySharedModule } from '../../shared';
import { Components } from '../../shared/camel/component-type';

import {
    ErrorEndpointComponent,
    ErrorEndpointDetailComponent,
    ErrorEndpointUpdateComponent,
    ErrorEndpointDialogComponent,
    ErrorEndpointDeletePopupComponent,
    ErrorEndpointDeleteDialogComponent,
    errorEndpointRoute,
    errorEndpointPopupRoute
} from './';

const ENTITY_STATES = [...errorEndpointRoute, ...errorEndpointPopupRoute];

@NgModule({
    imports: [
        GatewaySharedModule,
        RouterModule.forChild(ENTITY_STATES),
        NgSelectModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    exports: [
        ErrorEndpointComponent
    ],
    declarations: [
        ErrorEndpointComponent,
        ErrorEndpointDetailComponent,
        ErrorEndpointUpdateComponent,
        ErrorEndpointDialogComponent,
        ErrorEndpointDeleteDialogComponent,
        ErrorEndpointDeletePopupComponent
    ],
    entryComponents: [
        ErrorEndpointComponent,
        ErrorEndpointUpdateComponent,
        ErrorEndpointDialogComponent,
        ErrorEndpointDeleteDialogComponent,
        ErrorEndpointDeletePopupComponent,
    ],
    providers: [
        Components,
        ErrorEndpointDeletePopupComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayErrorEndpointModule {}
