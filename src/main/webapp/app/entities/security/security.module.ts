import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PopoverModule } from 'ngx-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { GatewaySharedModule } from 'app/shared';
import {
    SecurityComponent,
    SecurityDetailComponent,
    SecurityUpdateComponent,
    SecurityDeletePopupComponent,
    SecurityDeleteDialogComponent,
    SecurityUploadPopupComponent,
    SecurityUploadDialogComponent,
    SecurityUploadP12PopupComponent,
    SecurityUploadP12DialogComponent,
    SecuritySelfSignPopupComponent,
    SecuritySelfSignDialogComponent,
    securityRoute,
    securityPopupRoute,
    SecurityPopupService
} from './';

const ENTITY_STATES = [...securityRoute, ...securityPopupRoute];

@NgModule({
    imports: [GatewaySharedModule, FormsModule, ReactiveFormsModule, PopoverModule.forRoot(), RouterModule.forChild(ENTITY_STATES)],
    declarations: [
        SecurityComponent,
        SecurityDetailComponent,
        SecurityUpdateComponent,
        SecurityDeleteDialogComponent,
        SecurityDeletePopupComponent,
        SecurityUploadPopupComponent,
        SecurityUploadDialogComponent,
        SecurityUploadP12PopupComponent,
        SecurityUploadP12DialogComponent,
        SecuritySelfSignPopupComponent,
        SecuritySelfSignDialogComponent
    ],
    entryComponents: [
        SecurityComponent,
        SecurityUpdateComponent,
        SecurityDeleteDialogComponent,
        SecurityDeletePopupComponent,
        SecurityUploadPopupComponent,
        SecurityUploadDialogComponent,
        SecurityUploadP12PopupComponent,
        SecurityUploadP12DialogComponent,
        SecuritySelfSignPopupComponent,
        SecuritySelfSignDialogComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewaySecurityModule {}
