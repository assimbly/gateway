import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AceEditorModule } from 'ng2-ace-editor';

import { PopoverModule } from 'ngx-bootstrap';
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
    FlowLiveModeComponent,
    FlowRowComponent
} from './';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
        NgbModule,
        NgSelectModule,
        FormsModule,
        ReactiveFormsModule,
        PopoverModule.forRoot(),
        AceEditorModule
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
        FlowRowComponent,
        FlowLiveModeComponent
    ],
    entryComponents: [
        FlowComponent,
        FlowConfigurationComponent,
        FlowEditAllComponent,
        FlowDialogComponent,
        FlowPopupComponent,
        FlowDeleteDialogComponent,
        FlowDeletePopupComponent,
        FlowLiveModeComponent
    ],
    providers: [
        FlowService,
        FlowPopupService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayFlowModule { }
