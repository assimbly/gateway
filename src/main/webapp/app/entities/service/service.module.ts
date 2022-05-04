import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from 'app/shared/shared.module';
import { ServiceKeysModule } from '../../entities/service-keys/service-keys.module';

import { Services } from 'app/shared/camel/service-connections';

import { ServiceComponent } from './service.component';
import { ServiceDetailComponent } from './service-detail.component';
import { ServiceUpdateComponent } from './service-update.component';

import { ServiceDeleteDialogComponent } from './service-delete-dialog.component';
import { ServiceDialogComponent } from './service-dialog.component';
import { ServiceAllComponent } from './service-all.component';

import { serviceRoute } from './service.route';
import { servicePopupRoute } from './service.route';
import { ForbiddenServiceNamesValidatorDirective } from './service-validation.directive';
import { ForbiddenServiceKeysValidatorDirective } from './service-keys-validation.directive';

import { NgSelectModule } from '@ng-select/ng-select';
import { ServiceService } from 'app/entities/service/service.service';
import { ServicePopupService } from 'app/entities/service/service-popup.service';
import { ServicePopupComponent } from 'app/entities/service/service-dialog.component';

const ENTITY_STATES = [...serviceRoute, ...servicePopupRoute];

@NgModule({
  imports: [SharedModule, ServiceKeysModule, NgSelectModule, FormsModule, ReactiveFormsModule, RouterModule.forChild(ENTITY_STATES)],
  declarations: [
    ServiceComponent,
    ServiceAllComponent,
    ServiceDetailComponent,
    ServiceUpdateComponent,
    ServiceDialogComponent,
    ServiceDeleteDialogComponent,
    ServicePopupComponent,
    ForbiddenServiceNamesValidatorDirective,
    ForbiddenServiceKeysValidatorDirective,
  ],
  entryComponents: [
    ServiceComponent,
    ServiceAllComponent,
    ServiceUpdateComponent,
    ServiceDeleteDialogComponent,
    ServiceDialogComponent,
    ServicePopupComponent,
  ],
  providers: [ServiceService, ServicePopupService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ServiceModule {}
