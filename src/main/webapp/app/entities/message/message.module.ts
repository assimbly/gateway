import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HeaderModule } from '../../entities/header/header.module';
import { SharedModule } from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MessageComponent } from './message.component';
import { MessageDetailComponent } from './message-detail.component';
import { MessageDialogComponent } from './message-dialog.component';

import { MessageUpdateComponent } from './message-update.component';
import { MessageDeleteDialogComponent } from './message-delete-dialog.component';

import { MessageAllComponent } from './message-all.component';
import { messageRoute } from './message.route';
import { messagePopupRoute } from './message.route';

import { MessagePopupService } from './message-popup.service';
import { ForbiddenMessageNamesValidatorDirective } from './message-validation.directive';
import { ForbiddenHeaderValidatorDirective } from './header-validation.directive';

import { NgSelectModule } from '@ng-select/ng-select';
import { MessagePopupComponent } from 'app/entities/message/message-dialog.component';
import { MessageService } from 'app/entities/message/message.service';
const ENTITY_STATES = [...messageRoute, ...messagePopupRoute];

@NgModule({
  imports: [SharedModule, HeaderModule, NgSelectModule, FormsModule, ReactiveFormsModule, RouterModule.forChild(ENTITY_STATES)],
  declarations: [
    MessageComponent,
    MessageDetailComponent,
    MessageDialogComponent,
    MessageUpdateComponent,
    MessageAllComponent,
    MessageDeleteDialogComponent,
    MessagePopupComponent,
    ForbiddenMessageNamesValidatorDirective,
    ForbiddenHeaderValidatorDirective,
  ],
  entryComponents: [
    MessageComponent,
    MessageDialogComponent,
    MessageUpdateComponent,
    MessagePopupComponent,
    MessageAllComponent,
    MessageDeleteDialogComponent,
  ],
  providers: [MessageService, MessagePopupService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MessageModule {}
