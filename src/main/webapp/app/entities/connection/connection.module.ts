import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from 'app/shared/shared.module';
import { ConnectionKeysModule } from '../../entities/connection-keys/connection-keys.module';

import { Connections } from 'app/shared/camel/connections';

import { ConnectionComponent } from './connection.component';
import { ConnectionDetailComponent } from './connection-detail.component';
import { ConnectionUpdateComponent } from './connection-update.component';

import { ConnectionDeleteDialogComponent } from './connection-delete-dialog.component';
import { ConnectionDialogComponent } from './connection-dialog.component';
import { ConnectionAllComponent } from './connection-all.component';

import { connectionRoute } from './connection.route';
import { connectionPopupRoute } from './connection.route';
import { ForbiddenConnectionNamesValidatorDirective } from './connection-validation.directive';
import { ForbiddenConnectionKeysValidatorDirective } from './connection-keys-validation.directive';

import { NgSelectModule } from '@ng-select/ng-select';
import { ConnectionService } from 'app/entities/connection/connection.service';
import { ConnectionPopupService } from 'app/entities/connection/connection-popup.service';
import { ConnectionPopupComponent } from 'app/entities/connection/connection-dialog.component';

const ENTITY_STATES = [...connectionRoute, ...connectionPopupRoute];

@NgModule({
  imports: [SharedModule, ConnectionKeysModule, NgSelectModule, FormsModule, ReactiveFormsModule, RouterModule.forChild(ENTITY_STATES)],
  declarations: [
    ConnectionComponent,
    ConnectionAllComponent,
    ConnectionDetailComponent,
    ConnectionUpdateComponent,
    ConnectionDialogComponent,
    ConnectionDeleteDialogComponent,
    ConnectionPopupComponent,
    ForbiddenConnectionNamesValidatorDirective,
    ForbiddenConnectionKeysValidatorDirective,
  ],
  entryComponents: [
    ConnectionComponent,
    ConnectionAllComponent,
    ConnectionUpdateComponent,
    ConnectionDeleteDialogComponent,
    ConnectionDialogComponent,
    ConnectionPopupComponent,
  ],
  providers: [ConnectionService, ConnectionPopupService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ConnectionModule {}
