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
    serviceKeysPopupRoute,
    ForbiddenServiceKeysValidatorDirective
} from './';

const ENTITY_STATES = [...serviceKeysRoute, ...serviceKeysPopupRoute];

@NgModule({
    imports: [
        GatewaySharedModule,
        RouterModule.forChild(ENTITY_STATES)
    ],
    exports: [
        ServiceKeysComponent
    ],
    declarations: [
        ServiceKeysComponent,
        ServiceKeysDetailComponent,
        ServiceKeysUpdateComponent,
        ServiceKeysDeleteDialogComponent,
        ServiceKeysPopupComponent,
        ServiceKeysDeletePopupComponent,
        ForbiddenServiceKeysValidatorDirective
    ],
    entryComponents: [ServiceKeysComponent, ServiceKeysUpdateComponent, ServiceKeysDeleteDialogComponent, ServiceKeysDeletePopupComponent],
    providers: [
        ServiceKeysService,
        ServiceKeysPopupService,
        ServiceKeysDeletePopupComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayServiceKeysModule {}
