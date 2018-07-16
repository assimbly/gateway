import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { GatewaySharedModule } from '../../shared';
import { Components } from '../../shared/camel/component-type';

import {
    ErrorEndpointService,
    ErrorEndpointPopupService,
    ErrorEndpointComponent,
    ErrorEndpointDetailComponent,
    ErrorEndpointDialogComponent,
    ErrorEndpointPopupComponent,
    ErrorEndpointDeletePopupComponent,
    ErrorEndpointDeleteDialogComponent,
    errorEndpointRoute,
    errorEndpointPopupRoute,
} from './';

const ENTITY_STATES = [
    ...errorEndpointRoute,
    ...errorEndpointPopupRoute,
];

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
        ErrorEndpointDialogComponent,
        ErrorEndpointDeleteDialogComponent,
        ErrorEndpointPopupComponent,
        ErrorEndpointDeletePopupComponent,
    ],
    entryComponents: [
        ErrorEndpointComponent,
        ErrorEndpointDialogComponent,
        ErrorEndpointPopupComponent,
        ErrorEndpointDeleteDialogComponent,
        ErrorEndpointDeletePopupComponent,
    ],
    providers: [
        Components,
        ErrorEndpointService,
        ErrorEndpointPopupService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayErrorEndpointModule { }
