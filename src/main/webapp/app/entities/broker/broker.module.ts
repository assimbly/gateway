import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
// import { AceEditorModule } from 'ng2-ace-editor';
import { AceModule } from 'ngx-ace-wrapper';
import { ACE_CONFIG } from 'ngx-ace-wrapper';
import { AceConfigInterface } from 'ngx-ace-wrapper';
// import { AceEditorModule } from 'ng2-ace-editor';
import { CommonModule } from '@angular/common';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageSearchByMessageIdPipe } from './message.searchbymessageid.pipe';

import { GatewaySharedModule } from 'app/shared/shared.module';

import { BrokerComponent } from './broker.component';
import { BrokerDetailComponent } from './broker-detail.component';
import { BrokerUpdateComponent } from './broker-update.component';
import { BrokerMessageSenderComponent } from './broker-message-sender.component';
import { BrokerMessageBrowserComponent } from './broker-message-browser.component';
import { BrokerMessageBrowserRowComponent } from './broker-message-browser-row.component';
import { BrokerDeletePopupComponent } from './broker-delete-dialog.component';
import { BrokerDeleteDialogComponent } from './broker-delete-dialog.component';
import { brokerRoute } from './broker.route';
import { brokerPopupRoute } from './broker.route';

import { FlowComponent } from 'app/entities/flow/flow.component';
import { MessageSortByHeaderKeyPipePipe } from 'app/entities/broker/message.sortbyheaderkey.pipe';

const ENTITY_STATES = [...brokerRoute, ...brokerPopupRoute];
const DEFAULT_ACE_CONFIG: AceConfigInterface = {};

@NgModule({
    imports: [
        GatewaySharedModule,
        // AceEditorModule,
        AceModule,
        RouterModule.forChild(ENTITY_STATES),
        NgbModule,
        NgSelectModule,
        FormsModule,
        ReactiveFormsModule,
        PopoverModule.forRoot(),
        CommonModule
    ],
    exports: [BrokerComponent],
    declarations: [
        BrokerComponent,
        BrokerDetailComponent,
        BrokerUpdateComponent,
        BrokerDeleteDialogComponent,
        BrokerDeletePopupComponent,
        BrokerMessageSenderComponent,
        BrokerMessageBrowserComponent,
        BrokerMessageBrowserRowComponent,
        MessageSearchByMessageIdPipe,
        MessageSortByHeaderKeyPipePipe
    ],
    entryComponents: [BrokerComponent, BrokerUpdateComponent, BrokerDeleteDialogComponent, BrokerDeletePopupComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: [
        {
            provide: ACE_CONFIG,
            useValue: DEFAULT_ACE_CONFIG
        }
    ]
})
export class GatewayBrokerModule {}
