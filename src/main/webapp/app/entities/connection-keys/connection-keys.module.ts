import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Connections } from 'app/shared/camel/connections';
import { SharedModule } from 'app/shared/shared.module';

import { ConnectionKeysComponent } from './connection-keys.component';
import { ConnectionKeysDetailComponent } from './connection-keys-detail.component';
import { ConnectionKeysUpdateComponent } from './connection-keys-update.component';
import { ConnectionKeysDeleteDialogComponent } from './connection-keys-delete-dialog.component';
import { ForbiddenConnectionKeysValidatorDirective } from './connection-keys-validation.directive';
import { connectionKeysRoute } from './connection-keys.route';

const ENTITY_STATES = [...connectionKeysRoute];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(ENTITY_STATES)],
  exports: [ConnectionKeysComponent],
  declarations: [
    ConnectionKeysComponent,
    ConnectionKeysDetailComponent,
    ConnectionKeysUpdateComponent,
    ConnectionKeysDeleteDialogComponent,
    ForbiddenConnectionKeysValidatorDirective,
  ],
  entryComponents: [ConnectionKeysComponent, ConnectionKeysUpdateComponent, ConnectionKeysDeleteDialogComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ConnectionKeysModule {}
