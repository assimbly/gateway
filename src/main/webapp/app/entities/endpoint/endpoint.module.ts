import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { GatewaySharedModule } from 'app/shared/shared.module';
import { Components } from '../../shared/camel/component-type';

import {
    EndpointComponent,
    EndpointDetailComponent,
    EndpointUpdateComponent,
    EndpointDeletePopupComponent,
    EndpointDeleteDialogComponent,
    endpointRoute,
    endpointPopupRoute
} from './';

const ENTITY_STATES = [...endpointRoute, ...endpointPopupRoute];

@NgModule({
    imports: [GatewaySharedModule, RouterModule.forChild(ENTITY_STATES), NgSelectModule, FormsModule, ReactiveFormsModule],
    exports: [EndpointComponent],
    declarations: [
        EndpointComponent,
        EndpointDetailComponent,
        EndpointUpdateComponent,
        EndpointDeleteDialogComponent,
        EndpointDeletePopupComponent
    ],
    entryComponents: [EndpointComponent, EndpointUpdateComponent, EndpointDeleteDialogComponent, EndpointDeletePopupComponent],
    providers: [Components, EndpointDeletePopupComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayEndpointModule {}
