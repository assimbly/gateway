import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GatewaySharedModule } from '../../shared';
import {
    FlowService,
    FlowPopupService,
    FlowComponent,
    FlowDetailComponent,
    FlowDialogComponent,
    FlowPopupComponent,
    FlowDeletePopupComponent,
    FlowDeleteDialogComponent,
    flowRoute,
    flowPopupRoute,
} from './';

const ENTITY_STATES = [
    ...flowRoute,
    ...flowPopupRoute,
];

@NgModule({
    imports: [
        GatewaySharedModule,
        RouterModule.forChild(ENTITY_STATES)
    ],
    declarations: [
        FlowComponent,
        FlowDetailComponent,
        FlowDialogComponent,
        FlowDeleteDialogComponent,
        FlowPopupComponent,
        FlowDeletePopupComponent,
    ],
    entryComponents: [
        FlowComponent,
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
