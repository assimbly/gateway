import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { GatewaySharedModule } from '../../shared';
import { Components } from '../../shared/camel/component-type';

import {
    FromEndpointService,
    FromEndpointPopupService,
    FromEndpointComponent,
    FromEndpointDetailComponent,
    FromEndpointDialogComponent,
    FromEndpointPopupComponent,
    FromEndpointDeletePopupComponent,
    FromEndpointDeleteDialogComponent,
    fromEndpointRoute,
    fromEndpointPopupRoute,
} from './';

const ENTITY_STATES = [
    ...fromEndpointRoute,
    ...fromEndpointPopupRoute,
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
        FromEndpointComponent
    ],
    declarations: [
        FromEndpointComponent,
        FromEndpointDetailComponent,
        FromEndpointDialogComponent,
        FromEndpointDeleteDialogComponent,
        FromEndpointPopupComponent,
        FromEndpointDeletePopupComponent,
    ],
    entryComponents: [
        FromEndpointComponent,
        FromEndpointDialogComponent,
        FromEndpointPopupComponent,
        FromEndpointDeleteDialogComponent,
        FromEndpointDeletePopupComponent,
    ],
    providers: [
        Components,
        FromEndpointService,
        FromEndpointPopupService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayFromEndpointModule { }
