import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GatewaySharedModule } from 'app/shared';
import {
    HeaderKeysComponent,
    HeaderKeysDetailComponent,
    HeaderKeysUpdateComponent,
    HeaderKeysDeletePopupComponent,
    HeaderKeysDeleteDialogComponent,
    headerKeysRoute,
    headerKeysPopupRoute
} from './';

const ENTITY_STATES = [...headerKeysRoute, ...headerKeysPopupRoute];

@NgModule({
    imports: [GatewaySharedModule, RouterModule.forChild(ENTITY_STATES)],
    declarations: [
        HeaderKeysComponent,
        HeaderKeysDetailComponent,
        HeaderKeysUpdateComponent,
        HeaderKeysDeleteDialogComponent,
        HeaderKeysDeletePopupComponent
    ],
    entryComponents: [HeaderKeysComponent, HeaderKeysUpdateComponent, HeaderKeysDeleteDialogComponent, HeaderKeysDeletePopupComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayHeaderKeysModule {}
