import { NgModule, CUSTOM_ELEMENTS_SCHEMA, ErrorHandler } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { SharedModule } from 'app/shared/shared.module';
import { EndpointModule } from '../../entities/endpoint/endpoint.module';
import { ServiceModule } from '../../entities/service/service.module';
import { HeaderModule } from '../../entities/header/header.module';
import { RouteModule } from '../../entities/route/route.module';
import { MaintenanceModule } from '../../entities/maintenance/maintenance.module';
import { SecurityModule } from '../../entities/security/security.module';
import { AceModule } from 'ngx-ace-wrapper';
import { ACE_CONFIG } from 'ngx-ace-wrapper';
import { AceConfigInterface } from 'ngx-ace-wrapper';
// import { AceEditorModule } from 'ng2-ace-editor';
import { CommonModule } from '@angular/common';

import { FlowComponent } from './flow.component';
import { FlowDetailComponent } from './flow-detail.component';
import { FlowUpdateComponent } from './flow-update.component';
import { FlowDeleteDialogComponent } from './flow-delete-dialog.component';
import { FlowDeletePopupComponent } from './flow-delete-dialog.component';
import { flowRoute } from './flow.route';
import { flowPopupRoute } from './flow.route';
import { FlowPopupService } from './flow-popup.service';
import { FlowRowComponent } from './flow-row.component';
import { FlowSearchByNamePipe } from './flow.searchbyname.pipe';
import { FlowEditorComponent } from './editor/flow-editor.component';
import { FlowMessageSenderComponent } from './sender/flow-message-sender.component';

import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlowService } from 'app/entities/flow/flow.service';

import { Components } from 'app/shared/camel/component-type';
import { Services } from 'app/shared/camel/service-connections';

const ENTITY_STATES = [...flowRoute, ...flowPopupRoute];
const DEFAULT_ACE_CONFIG: AceConfigInterface = {};

@NgModule({
  imports: [
    SharedModule,
    EndpointModule,
    ServiceModule,
    SecurityModule,
    HeaderModule,
    RouteModule,
    MaintenanceModule,
    // AceEditorModule,
    AceModule,
    RouterModule.forChild(ENTITY_STATES),
    NgbModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    PopoverModule.forRoot(),
  ],
  exports: [FlowComponent],
  declarations: [
    FlowComponent,
    FlowRowComponent,
    FlowUpdateComponent,
    FlowEditorComponent,
    FlowMessageSenderComponent,
    FlowDetailComponent,
    FlowDeleteDialogComponent,
    FlowDeletePopupComponent,
    FlowSearchByNamePipe,
  ],
  entryComponents: [
    FlowComponent,
    FlowUpdateComponent,
    FlowEditorComponent,
    FlowMessageSenderComponent,
    FlowDeleteDialogComponent,
    FlowDeleteDialogComponent,
    FlowDeletePopupComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FlowModule {}
