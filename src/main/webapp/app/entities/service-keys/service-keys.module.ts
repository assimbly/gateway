import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GatewaySharedModule } from 'app/shared';
import {
    ServiceKeysComponent,
    ServiceKeysDetailComponent,
    ServiceKeysUpdateComponent,
    ServiceKeysDeletePopupComponent,
    ServiceKeysDeleteDialogComponent,
    serviceKeysRoute,
    serviceKeysPopupRoute
} from './';

const ENTITY_STATES = [...serviceKeysRoute, ...serviceKeysPopupRoute];

@NgModule({
    imports: [GatewaySharedModule, RouterModule.forChild(ENTITY_STATES)],
    declarations: [
        ServiceKeysComponent,
        ServiceKeysDetailComponent,
        ServiceKeysUpdateComponent,
        ServiceKeysDeleteDialogComponent,
        ServiceKeysDeletePopupComponent
    ],
    entryComponents: [ServiceKeysComponent, ServiceKeysUpdateComponent, ServiceKeysDeleteDialogComponent, ServiceKeysDeletePopupComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayServiceKeysModule {}
