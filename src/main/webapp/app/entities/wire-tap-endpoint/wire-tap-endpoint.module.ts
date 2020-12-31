import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { PopoverModule } from 'ngx-bootstrap';
import { GatewaySharedModule } from '../../shared';
import { Components } from '../../shared/camel/component-type';
import {
    WireTapEndpointComponent,
    WireTapEndpointDetailComponent,
    WireTapEndpointUpdateComponent,
    WireTapEndpointDeletePopupComponent,
    WireTapEndpointDeleteDialogComponent,
    wireTapEndpointRoute,
    wireTapEndpointPopupRoute
} from './';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

const ENTITY_STATES = [...wireTapEndpointRoute, ...wireTapEndpointPopupRoute];

@NgModule({
    imports: [
        GatewaySharedModule,
        ReactiveFormsModule,
        NgSelectModule,
        FormsModule,
        RouterModule.forChild(ENTITY_STATES),
        PopoverModule.forRoot()
    ],
    declarations: [
        WireTapEndpointComponent,
        WireTapEndpointDetailComponent,
        WireTapEndpointUpdateComponent,
        WireTapEndpointDeleteDialogComponent,
        WireTapEndpointDeletePopupComponent
    ],
    entryComponents: [
        WireTapEndpointComponent,
        WireTapEndpointUpdateComponent,
        WireTapEndpointDeleteDialogComponent,
        WireTapEndpointDeletePopupComponent
    ],
    providers: [
        Components,
        WireTapEndpointUpdateComponent,
        WireTapEndpointDeleteDialogComponent,
        WireTapEndpointDeletePopupComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayWireTapEndpointModule {}
