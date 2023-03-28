import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageSearchByMessageIdPipe } from './message.searchbymessageid.pipe';

import { SharedModule } from 'app/shared/shared.module';

import { BrokerComponent } from './broker.component';
import { BrokerDetailComponent } from './broker-detail.component';
import { BrokerUpdateComponent } from './broker-update.component';
import { BrokerMessageSenderComponent } from './sender/broker-message-sender.component';
import { BrokerMessageBrowserComponent } from './browser/broker-message-browser.component';
import { BrokerMessageBrowserRowComponent } from './browser/broker-message-browser-row.component';
import { BrokerDeleteDialogComponent } from './broker-delete-dialog.component';
import { brokerRoute } from './broker.route';

//import { CodemirrorModule } from '@ctrl/ngx-codemirror';

import { FlowComponent } from 'app/entities/flow/flow.component';
import { MessageSortByHeaderPipePipe } from 'app/entities/broker/message.sortbyheader.pipe';

const ENTITY_STATES = [...brokerRoute];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(ENTITY_STATES),
    NgbModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    PopoverModule.forRoot(),
    CommonModule,
  ],
  exports: [BrokerComponent],
  declarations: [
    BrokerComponent,
    BrokerMessageBrowserRowComponent,
    BrokerDetailComponent,
    BrokerUpdateComponent,
    BrokerDeleteDialogComponent,
    BrokerMessageSenderComponent,
    BrokerMessageBrowserComponent,
    MessageSearchByMessageIdPipe,
    MessageSortByHeaderPipePipe,
  ],
  entryComponents: [BrokerComponent, BrokerUpdateComponent, BrokerDeleteDialogComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], 
})
export class BrokerModule {}
