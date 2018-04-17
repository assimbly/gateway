import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { GatewaySharedModule } from '../../shared';
import { GatewayFromEndpointModule } from '../../entities/from-endpoint/from-endpoint.module';
import { GatewayToEndpointModule } from '../../entities/to-endpoint/to-endpoint.module';
import { GatewayErrorEndpointModule } from '../../entities/error-endpoint/error-endpoint.module';

import {
    FlowService,
    FlowPopupService,
    FlowComponent,
    FlowConfigurationComponent,
    FlowDetailComponent,
    FlowEditAllComponent,
    FlowDialogComponent,
    FlowPopupComponent,
    FlowDeletePopupComponent,
    FlowDeleteDialogComponent,
    flowRoute,
    flowPopupRoute,
} from './';
import { FlowRowComponent } from './flow-row.component';

const ENTITY_STATES = [
    ...flowRoute,
    ...flowPopupRoute,
];

@NgModule({
    imports: [
        GatewaySharedModule,
        GatewayFromEndpointModule,
        GatewayToEndpointModule,
        GatewayErrorEndpointModule,
        RouterModule.forChild(ENTITY_STATES),
        NgbModule
    ],
    exports: [
        FlowComponent
    ],
    declarations: [
        FlowComponent,
        FlowConfigurationComponent,
        FlowDetailComponent,
        FlowEditAllComponent,
        FlowDialogComponent,
        FlowDeleteDialogComponent,
        FlowPopupComponent,
        FlowDeletePopupComponent,
        FlowRowComponent
    ],
    entryComponents: [
        FlowComponent,
        FlowConfigurationComponent,
        FlowEditAllComponent,
        FlowDialogComponent,
        FlowPopupComponent,
        FlowDeleteDialogComponent,
        FlowDeletePopupComponent,
    ],
    providers: [
        FlowService,
        FlowPopupService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayFlowModule {}
