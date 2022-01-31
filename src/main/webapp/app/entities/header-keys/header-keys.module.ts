import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GatewaySharedModule } from 'app/shared/shared.module';
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
    imports: [GatewaySharedModule, RouterModule.forChild(ENTITY_STATES)],
    exports: [HeaderKeysComponent],
    declarations: [
        HeaderKeysComponent,
        HeaderKeysDetailComponent,
        HeaderKeysUpdateComponent,
        HeaderKeysDeleteDialogComponent,
        HeaderKeysDeletePopupComponent,
        ForbiddenHeaderKeysValidatorDirective
    ],
    entryComponents: [HeaderKeysComponent, HeaderKeysUpdateComponent, HeaderKeysDeleteDialogComponent, HeaderKeysDeletePopupComponent],
    providers: [HeaderKeysDeletePopupComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayHeaderKeysModule {}
