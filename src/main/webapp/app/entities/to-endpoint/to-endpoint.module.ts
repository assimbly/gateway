import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GatewaySharedModule } from '../../shared';
import {
    ToEndpointService,
    ToEndpointPopupService,
    ToEndpointComponent,
    ToEndpointDetailComponent,
    ToEndpointDialogComponent,
    ToEndpointPopupComponent,
    ToEndpointDeletePopupComponent,
    ToEndpointDeleteDialogComponent,
    toEndpointRoute,
    toEndpointPopupRoute,
} from './';

const ENTITY_STATES = [
    ...toEndpointRoute,
    ...toEndpointPopupRoute,
];

@NgModule({
    imports: [
        GatewaySharedModule,
        RouterModule.forChild(ENTITY_STATES)
    ],
    declarations: [
        ToEndpointComponent,
        ToEndpointDetailComponent,
        ToEndpointDialogComponent,
        ToEndpointDeleteDialogComponent,
        ToEndpointPopupComponent,
        ToEndpointDeletePopupComponent,
    ],
    entryComponents: [
        ToEndpointComponent,
        ToEndpointDialogComponent,
        ToEndpointPopupComponent,
        ToEndpointDeleteDialogComponent,
        ToEndpointDeletePopupComponent,
    ],
    providers: [
        ToEndpointService,
        ToEndpointPopupService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayToEndpointModule {}
