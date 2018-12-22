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
    headerKeysPopupRoute,
    ForbiddenHeaderKeysValidatorDirective
} from './';

const ENTITY_STATES = [...headerKeysRoute, ...headerKeysPopupRoute];

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
        HeaderKeysUpdateComponent,
        HeaderKeysDeleteDialogComponent,
        HeaderKeysPopupComponent,
        HeaderKeysDeletePopupComponent,
        ForbiddenHeaderKeysValidatorDirective
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
        HeaderKeysDeletePopupComponent
    ],
    entryComponents: [HeaderKeysComponent, HeaderKeysUpdateComponent, HeaderKeysDeleteDialogComponent, HeaderKeysDeletePopupComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayHeaderKeysModule {}
