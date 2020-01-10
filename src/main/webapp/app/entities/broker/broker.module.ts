import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
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

const ENTITY_STATES = [...brokerRoute, ...brokerPopupRoute];

@NgModule({
    imports: [GatewaySharedModule, AceEditorModule, RouterModule.forChild(ENTITY_STATES)],
    declarations: [BrokerComponent, BrokerDetailComponent, BrokerUpdateComponent, BrokerDeleteDialogComponent, BrokerDeletePopupComponent],
    entryComponents: [BrokerComponent, BrokerUpdateComponent, BrokerDeleteDialogComponent, BrokerDeletePopupComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayBrokerModule {}
