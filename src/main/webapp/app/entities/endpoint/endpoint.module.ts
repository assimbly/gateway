import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from 'app/shared/shared.module';
import { Components } from '../../shared/camel/component-type';

import { EndpointComponent } from './endpoint.component';
import { EndpointDetailComponent } from './endpoint-detail.component';
import { EndpointUpdateComponent } from './endpoint-update.component';

import { EndpointDeletePopupComponent } from './endpoint-delete-dialog.component';
import { EndpointDeleteDialogComponent } from './endpoint-delete-dialog.component';

import { endpointRoute } from './endpoint.route';
import { endpointPopupRoute } from './endpoint.route';

const ENTITY_STATES = [...endpointRoute, ...endpointPopupRoute];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(ENTITY_STATES), NgSelectModule, FormsModule, ReactiveFormsModule],
  exports: [EndpointComponent],
  declarations: [
    EndpointComponent,
    EndpointDetailComponent,
    EndpointUpdateComponent,
    EndpointDeleteDialogComponent,
    EndpointDeletePopupComponent,
  ],
  entryComponents: [EndpointComponent, EndpointUpdateComponent, EndpointDeleteDialogComponent, EndpointDeletePopupComponent],
  providers: [Components, EndpointDeletePopupComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EndpointModule {}
