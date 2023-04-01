import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'app/shared/shared.module';

import { HeaderComponent } from './header.component';
import { HeaderDetailComponent } from './header-detail.component';
import { HeaderUpdateComponent } from '././header-update.component';
import { HeaderDeleteDialogComponent } from '././header-delete-dialog.component';
import { headerRoute } from './header.route';

import { ForbiddenHeaderValidatorDirective } from './header-validation.directive';

const ENTITY_STATES = [...headerRoute];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(ENTITY_STATES)],
  exports: [HeaderComponent],
  declarations: [
    HeaderComponent,
    HeaderDetailComponent,
    HeaderUpdateComponent,
    HeaderDeleteDialogComponent,
    ForbiddenHeaderValidatorDirective,
  ],
  entryComponents: [HeaderComponent, HeaderUpdateComponent, HeaderDeleteDialogComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HeaderModule {}
