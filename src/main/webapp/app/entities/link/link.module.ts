import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';

import { LinkComponent } from './link.component';
import { LinkDetailComponent } from './link-detail.component';
import { LinkUpdateComponent } from '././link-update.component';
import { LinkDeleteDialogComponent } from '././link-delete-dialog.component';
import { linkRoute } from './link.route';

import { ForbiddenLinkValidatorDirective } from './link-validation.directive';

const ENTITY_STATES = [...linkRoute];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(ENTITY_STATES)],
  exports: [LinkComponent],
  declarations: [
    LinkComponent,
    LinkDetailComponent,
    LinkUpdateComponent,
    LinkDeleteDialogComponent,
    ForbiddenLinkValidatorDirective,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LinkModule {}
