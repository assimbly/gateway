import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PopoverModule } from 'ngx-bootstrap';

import { GatewaySharedModule } from 'app/shared';
import {
    SecurityComponent,
    SecurityDetailComponent,
    SecurityUpdateComponent,
    SecurityDeletePopupComponent,
    SecurityDeleteDialogComponent,
    SecurityUploadPopupComponent,
    SecurityUploadDialogComponent,
    securityRoute,
    securityPopupRoute,
    SecurityPopupService
} from './';

const ENTITY_STATES = [...securityRoute, ...securityPopupRoute];

@NgModule({
    imports: [GatewaySharedModule, PopoverModule.forRoot(), RouterModule.forChild(ENTITY_STATES)],
    declarations: [
        SecurityComponent,
        SecurityDetailComponent,
        SecurityUpdateComponent,
        SecurityDeleteDialogComponent,
        SecurityDeletePopupComponent,
        SecurityUploadPopupComponent,
        SecurityUploadDialogComponent
    ],
    entryComponents: [
        SecurityComponent,
        SecurityUpdateComponent,
        SecurityDeleteDialogComponent,
        SecurityDeletePopupComponent,
        SecurityUploadPopupComponent,
        SecurityUploadDialogComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewaySecurityModule {}
