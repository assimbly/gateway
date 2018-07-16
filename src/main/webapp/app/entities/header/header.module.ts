import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GatewayHeaderKeysModule } from '../../entities/header-keys/header-keys.module';
import { GatewaySharedModule } from '../../shared';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {
    HeaderService,
    HeaderPopupService,
    HeaderComponent,
    HeaderDetailComponent,
    HeaderDialogComponent,
    HeaderPopupComponent,
    HeaderDeletePopupComponent,
    HeaderDeleteDialogComponent,
    HeaderAllComponent,
    headerRoute,
    headerPopupRoute,
    ForbiddenHeaderNamesValidatorDirective,
    ForbiddenHeaderKeysValidatorDirective
} from './';
import { NgSelectModule } from '@ng-select/ng-select';
const ENTITY_STATES = [
    ...headerRoute,
    ...headerPopupRoute,
];

@NgModule({
    imports: [
        GatewaySharedModule,
        GatewayHeaderKeysModule,
        NgSelectModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(ENTITY_STATES)
    ],
    declarations: [
        HeaderComponent,
        HeaderAllComponent,
        HeaderDetailComponent,
        HeaderDialogComponent,
        HeaderDeleteDialogComponent,
        HeaderPopupComponent,
        HeaderDeletePopupComponent,
        ForbiddenHeaderNamesValidatorDirective,
        ForbiddenHeaderKeysValidatorDirective
    ],
    entryComponents: [
        HeaderComponent,
        HeaderAllComponent,
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
