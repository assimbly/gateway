import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GatewaySharedModule } from 'app/shared';
import {
    SecurityComponent,
    SecurityDetailComponent,
    SecurityUpdateComponent,
    SecurityDeletePopupComponent,
    SecurityDeleteDialogComponent,
    securityRoute,
    securityPopupRoute
} from './';

const ENTITY_STATES = [...securityRoute, ...securityPopupRoute];

@NgModule({
    imports: [GatewaySharedModule, RouterModule.forChild(ENTITY_STATES)],
    declarations: [
        SecurityComponent,
        SecurityDetailComponent,
        SecurityUpdateComponent,
        SecurityDeleteDialogComponent,
        SecurityDeletePopupComponent
    ],
    entryComponents: [SecurityComponent, SecurityUpdateComponent, SecurityDeleteDialogComponent, SecurityDeletePopupComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewaySecurityModule {}
