import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GatewaySharedModule } from '../../shared';
import {
    HeaderKeysService,
    HeaderKeysPopupService,
    HeaderKeysComponent,
    HeaderKeysDetailComponent,
    HeaderKeysDialogComponent,
    HeaderKeysPopupComponent,
    HeaderKeysDeletePopupComponent,
    HeaderKeysDeleteDialogComponent,
    headerKeysRoute,
    headerKeysPopupRoute,
} from './';

const ENTITY_STATES = [
    ...headerKeysRoute,
    ...headerKeysPopupRoute,
];

@NgModule({
    imports: [
        GatewaySharedModule,
        RouterModule.forChild(ENTITY_STATES)
    ],
    exports: [
        HeaderKeysComponent
    ],
    declarations: [
        HeaderKeysComponent,
        HeaderKeysDetailComponent,
        HeaderKeysDialogComponent,
        HeaderKeysDeleteDialogComponent,
        HeaderKeysPopupComponent,
        HeaderKeysDeletePopupComponent,
    ],
    entryComponents: [
        HeaderKeysComponent,
        HeaderKeysDialogComponent,
        HeaderKeysPopupComponent,
        HeaderKeysDeleteDialogComponent,
        HeaderKeysDeletePopupComponent,
    ],
    providers: [
        HeaderKeysService,
        HeaderKeysPopupService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayHeaderKeysModule {}
