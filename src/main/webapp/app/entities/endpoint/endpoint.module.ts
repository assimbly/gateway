import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from 'app/shared/shared.module';
import { Components } from '../../shared/camel/component-type';

import { EndpointComponent } from './endpoint.component';
import { EndpointDetailComponent } from './endpoint-detail.component';
import { EndpointUpdateComponent } from './endpoint-update.component';

import { EndpointDeleteDialogComponent } from './endpoint-delete-dialog.component';

import { endpointRoute } from './endpoint.route';

const ENTITY_STATES = [...endpointRoute];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(ENTITY_STATES), NgSelectModule, FormsModule, ReactiveFormsModule],
  exports: [EndpointComponent],
  declarations: [
    EndpointComponent,
    EndpointDetailComponent,
    EndpointUpdateComponent,
    EndpointDeleteDialogComponent,
  ],
  entryComponents: [EndpointComponent, EndpointUpdateComponent, EndpointDeleteDialogComponent],
  providers: [Components],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EndpointModule {}
