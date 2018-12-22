import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GatewaySharedModule } from 'app/shared';
import {
    FlowComponent,
    FlowDetailComponent,
    FlowUpdateComponent,
    FlowDeletePopupComponent,
    FlowDeleteDialogComponent,
    flowRoute,
    flowPopupRoute
} from './';

const ENTITY_STATES = [...flowRoute, ...flowPopupRoute];

@NgModule({
    imports: [GatewaySharedModule, RouterModule.forChild(ENTITY_STATES)],
    declarations: [FlowComponent, FlowDetailComponent, FlowUpdateComponent, FlowDeleteDialogComponent, FlowDeletePopupComponent],
    entryComponents: [FlowComponent, FlowUpdateComponent, FlowDeleteDialogComponent, FlowDeletePopupComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayFlowModule {}
