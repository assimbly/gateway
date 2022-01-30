import { NgModule, CUSTOM_ELEMENTS_SCHEMA, ErrorHandler } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { GatewaySharedModule } from '../../shared';
import { GatewayEndpointModule } from '../../entities/endpoint/endpoint.module';
import { GatewayServiceModule } from '../../entities/service/service.module';
import { GatewayHeaderModule } from '../../entities/header/header.module';
import { GatewayRouteModule } from '../../entities/route/route.module';
import { GatewayMaintenanceModule } from '../../entities/maintenance/maintenance.module';
import { GatewaySecurityModule } from '../../entities/security/security.module';
import { AceModule } from 'ngx-ace-wrapper';
import { ACE_CONFIG } from 'ngx-ace-wrapper';
import { AceConfigInterface } from 'ngx-ace-wrapper';
// import { AceEditorModule } from 'ng2-ace-editor';
import { FlowSearchByNamePipe } from './flow.searchbyname.pipe';
import { FlowEditorComponent } from './';
import { FlowMessageSenderComponent } from './';
import {
    FlowComponent,
    FlowDetailComponent,
    FlowUpdateComponent,
    FlowDeletePopupComponent,
    FlowDeleteDialogComponent,
    flowRoute,
    flowPopupRoute,
    FlowPopupService,
    FlowRowComponent
} from './';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlowService } from 'app/entities/flow/flow.service';

import { Components } from 'app/shared/camel/component-type';
import { Services } from 'app/shared/camel/service-connections';

const ENTITY_STATES = [...flowRoute, ...flowPopupRoute];
const DEFAULT_ACE_CONFIG: AceConfigInterface = {};

@NgModule({
    imports: [
        GatewaySharedModule,
        GatewayEndpointModule,
        GatewayServiceModule,
        GatewaySecurityModule,
        GatewayHeaderModule,
        GatewayRouteModule,
        GatewayMaintenanceModule,
        // AceEditorModule,
        AceModule,
        RouterModule.forChild(ENTITY_STATES),
        NgbModule,
        NgSelectModule,
        FormsModule,
        ReactiveFormsModule,
        PopoverModule.forRoot()
    ],
    exports: [FlowComponent],
    declarations: [
        FlowComponent,
        FlowUpdateComponent,
        FlowEditorComponent,
        FlowMessageSenderComponent,
        FlowDetailComponent,
        FlowDeleteDialogComponent,
        FlowDeletePopupComponent,
        FlowRowComponent,
        FlowSearchByNamePipe
    ],
    entryComponents: [
        FlowComponent,
        FlowUpdateComponent,
        FlowEditorComponent,
        FlowMessageSenderComponent,
        FlowDeleteDialogComponent,
        FlowDeleteDialogComponent,
        FlowDeletePopupComponent
    ],
    providers: [
        FlowService,
        FlowPopupService,
        {
            provide: ACE_CONFIG,
            useValue: DEFAULT_ACE_CONFIG
        }
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GatewayFlowModule {}
