import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';

import { DeploymentComponent } from './deployment.component';

import { deploymentRoute } from './deployment.route';

@NgModule({
  imports: [SharedModule, RouterModule.forChild([deploymentRoute])],
  declarations: [DeploymentComponent],
})
export class DeploymentModule {}
