import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GatewayHeaderKeysModule } from '../../entities/header-keys/header-keys.module';
import { GatewaySharedModule } from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HeaderComponent } from './header.component';
import { HeaderDetailComponent } from './header-detail.component';
import { HeaderDialogComponent } from './header-dialog.component';

import { HeaderUpdateComponent } from './header-update.component';
import { HeaderDeleteDialogComponent } from './header-delete-dialog.component';
import { HeaderDeletePopupComponent } from './header-delete-dialog.component';

import { HeaderAllComponent } from './header-all.component';
import { headerRoute } from './header.route';
import { headerPopupRoute } from './header.route';

import { HeaderPopupService } from './header-popup.service';
import { ForbiddenHeaderNamesValidatorDirective } from './header-validation.directive';
import { ForbiddenHeaderKeysValidatorDirective } from './header-keys-validation.directive';

import { NgSelectModule } from '@ng-select/ng-select';
import { HeaderPopupComponent } from 'app/entities/header/header-dialog.component';
import { HeaderService } from 'app/entities/header/header.service';
const ENTITY_STATES = [...headerRoute, ...headerPopupRoute];

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
        HeaderDetailComponent,
        HeaderDialogComponent,
        HeaderUpdateComponent,
        HeaderAllComponent,
        HeaderDeleteDialogComponent,
        HeaderDeletePopupComponent,
        HeaderPopupComponent,
        ForbiddenHeaderNamesValidatorDirective,
        ForbiddenHeaderKeysValidatorDirective
    ],
    entryComponents: [
        HeaderComponent,
        HeaderDialogComponent,
        HeaderUpdateComponent,
        HeaderPopupComponent,
        HeaderAllComponent,
        HeaderDeleteDialogComponent,
        HeaderDeletePopupComponent
    ],
    providers: [HeaderService, HeaderPopupService],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayHeaderModule {}
