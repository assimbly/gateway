import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GatewayHeaderKeysModule } from '../../entities/header-keys/header-keys.module';
import { GatewaySharedModule } from '../../shared';
import {
    HeaderService,
    HeaderPopupService,
    HeaderComponent,
    HeaderDetailComponent,
    HeaderDialogComponent,
    HeaderPopupComponent,
    HeaderDeletePopupComponent,
    HeaderDeleteDialogComponent,
    headerRoute,
    headerPopupRoute,
} from './';

const ENTITY_STATES = [
    ...headerRoute,
    ...headerPopupRoute,
];

@NgModule({
    imports: [
        GatewaySharedModule,
        GatewayHeaderKeysModule,
        RouterModule.forChild(ENTITY_STATES)
    ],
    declarations: [
        HeaderComponent,
        HeaderDetailComponent,
        HeaderDialogComponent,
        HeaderDeleteDialogComponent,
        HeaderPopupComponent,
        HeaderDeletePopupComponent,
    ],
    entryComponents: [
        HeaderComponent,
        HeaderDialogComponent,
        HeaderPopupComponent,
        HeaderDeleteDialogComponent,
        HeaderDeletePopupComponent,
    ],
    providers: [
        HeaderService,
        HeaderPopupService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayHeaderModule {}
