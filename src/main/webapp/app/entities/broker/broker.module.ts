import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
//import { AceEditorModule } from 'ng2-ace-editor';
import { AceModule } from 'ngx-ace-wrapper';
import { ACE_CONFIG } from 'ngx-ace-wrapper';
import { AceConfigInterface } from 'ngx-ace-wrapper';
import { AceEditorModule } from 'ng2-ace-editor';

import { GatewaySharedModule } from 'app/shared';
import {
    BrokerComponent,
    BrokerDetailComponent,
    BrokerUpdateComponent,
    BrokerDeletePopupComponent,
    BrokerDeleteDialogComponent,
    brokerRoute,
    brokerPopupRoute
} from './';
import { FlowComponent } from 'app/entities/flow';

const ENTITY_STATES = [...brokerRoute, ...brokerPopupRoute];
const DEFAULT_ACE_CONFIG: AceConfigInterface = {};

@NgModule({
    imports: [GatewaySharedModule, AceEditorModule, AceModule, RouterModule.forChild(ENTITY_STATES)],
    exports: [BrokerComponent],
    declarations: [BrokerComponent, BrokerDetailComponent, BrokerUpdateComponent, BrokerDeleteDialogComponent, BrokerDeletePopupComponent],
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
