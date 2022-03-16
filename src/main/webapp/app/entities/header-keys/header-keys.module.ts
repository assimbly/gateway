import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'app/shared/shared.module';

import { HeaderKeysComponent } from './header-keys.component';
import { HeaderKeysDetailComponent } from './header-keys-detail.component';
import { HeaderKeysUpdateComponent } from '././header-keys-update.component';
import { HeaderKeysDeleteDialogComponent } from '././header-keys-delete-dialog.component';
import { headerKeysRoute } from './header-keys.route';

import { ForbiddenHeaderKeysValidatorDirective } from './header-keys-validation.directive';

const ENTITY_STATES = [...headerKeysRoute];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(ENTITY_STATES)],
  exports: [HeaderKeysComponent],
  declarations: [
    HeaderKeysComponent,
    HeaderKeysDetailComponent,
    HeaderKeysUpdateComponent,
    HeaderKeysDeleteDialogComponent,
    ForbiddenHeaderKeysValidatorDirective,
  ],
  entryComponents: [HeaderKeysComponent, HeaderKeysUpdateComponent, HeaderKeysDeleteDialogComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HeaderKeysModule {}
