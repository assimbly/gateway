import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Services } from 'app/shared/camel/service-connections';
import { SharedModule } from 'app/shared/shared.module';

import { ServiceKeysComponent } from './service-keys.component';
import { ServiceKeysDetailComponent } from './service-keys-detail.component';
import { ServiceKeysUpdateComponent } from './service-keys-update.component';
import { ServiceKeysDeletePopupComponent } from './service-keys-delete-dialog.component';
import { ServiceKeysDeleteDialogComponent } from './service-keys-delete-dialog.component';
import { ForbiddenServiceKeysValidatorDirective } from './service-keys-validation.directive';
import { serviceKeysRoute } from './service-keys.route';
import { serviceKeysPopupRoute } from './service-keys.route';

const ENTITY_STATES = [...serviceKeysRoute, ...serviceKeysPopupRoute];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(ENTITY_STATES)],
  exports: [ServiceKeysComponent],
  declarations: [
    ServiceKeysComponent,
    ServiceKeysDetailComponent,
    ServiceKeysUpdateComponent,
    ServiceKeysDeleteDialogComponent,
    ServiceKeysDeletePopupComponent,
    ForbiddenServiceKeysValidatorDirective,
  ],
  entryComponents: [ServiceKeysComponent, ServiceKeysUpdateComponent, ServiceKeysDeleteDialogComponent, ServiceKeysDeletePopupComponent],
  providers: [ServiceKeysDeletePopupComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GatewayServiceKeysModule {}
