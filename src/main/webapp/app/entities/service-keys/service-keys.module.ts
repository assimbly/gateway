import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GatewaySharedModule } from '../../shared';
import {
    ServiceKeysService,
    ServiceKeysPopupService,
    ServiceKeysComponent,
    ServiceKeysDetailComponent,
    ServiceKeysDialogComponent,
    ServiceKeysPopupComponent,
    ServiceKeysDeletePopupComponent,
    ServiceKeysDeleteDialogComponent,
    serviceKeysRoute,
    serviceKeysPopupRoute,
    ForbiddenServiceKeysValidatorDirective
} from './';

const ENTITY_STATES = [
    ...serviceKeysRoute,
    ...serviceKeysPopupRoute,
];

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
        ServiceKeysDialogComponent,
        ServiceKeysDeleteDialogComponent,
        ServiceKeysPopupComponent,
        ServiceKeysDeletePopupComponent,
        ForbiddenServiceKeysValidatorDirective
    ],
    entryComponents: [
        ServiceKeysComponent,
        ServiceKeysDialogComponent,
        ServiceKeysPopupComponent,
        ServiceKeysDeleteDialogComponent,
        ServiceKeysDeletePopupComponent,
    ],
    providers: [
        ServiceKeysService,
        ServiceKeysPopupService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayServiceKeysModule {}
