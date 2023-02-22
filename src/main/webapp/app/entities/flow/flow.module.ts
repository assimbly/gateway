import { NgModule, CUSTOM_ELEMENTS_SCHEMA, ErrorHandler } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { SharedModule } from 'app/shared/shared.module';
import { StepModule } from '../../entities/step/step.module';
import { ConnectionModule } from '../../entities/connection/connection.module';
import { HeaderModule } from '../../entities/header/header.module';
import { RouteModule } from '../../entities/route/route.module';
import { MaintenanceModule } from '../../entities/maintenance/maintenance.module';
import { CommonModule } from '@angular/common';

import { FlowComponent } from './flow.component';
import { FlowDetailComponent } from './flow-detail.component';
import { FlowUpdateComponent } from './flow-update.component';
import { FlowDeleteDialogComponent } from './flow-delete-dialog.component';
import { flowRoute } from './flow.route';
import { FlowPopupService } from './flow-popup.service';
import { FlowRowComponent } from './flow-row.component';
import { FlowSearchByNamePipe } from './flow.searchbyname.pipe';
import { FlowEditorComponent } from './editor/flow-editor.component';
import { FlowEditorEsbComponent } from './editor/flow-editor-esb.component';
import { FlowMessageSenderComponent } from './sender/flow-message-sender.component';

import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlowService } from 'app/entities/flow/flow.service';

import { Components } from 'app/shared/camel/component-type';
import { Connections } from 'app/shared/camel/connections';

const ENTITY_STATES = [...flowRoute];

@NgModule({
  imports: [
    SharedModule,
    StepModule,
    ConnectionModule,
    HeaderModule,
    RouteModule,
    MaintenanceModule,
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
	  FlowEditorEsbComponent,
    FlowMessageSenderComponent,
    FlowDetailComponent,
    FlowDeleteDialogComponent,
    FlowSearchByNamePipe,
  ],
  entryComponents: [
    FlowComponent,
    FlowUpdateComponent,
    FlowEditorComponent,
    FlowMessageSenderComponent,
    FlowDeleteDialogComponent,
    FlowDeleteDialogComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FlowModule {}
