import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GatewaySharedModule } from 'app/shared';
import {
    HeaderComponent,
    HeaderDetailComponent,
    HeaderUpdateComponent,
    HeaderDeletePopupComponent,
    HeaderDeleteDialogComponent,
    headerRoute,
    headerPopupRoute
} from './';

const ENTITY_STATES = [...headerRoute, ...headerPopupRoute];

@NgModule({
    imports: [GatewaySharedModule, RouterModule.forChild(ENTITY_STATES)],
    declarations: [HeaderComponent, HeaderDetailComponent, HeaderUpdateComponent, HeaderDeleteDialogComponent, HeaderDeletePopupComponent],
    entryComponents: [HeaderComponent, HeaderUpdateComponent, HeaderDeleteDialogComponent, HeaderDeletePopupComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayHeaderModule {}
