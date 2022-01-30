import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GatewaySharedModule } from 'app/shared/shared.module';

import { DeploymentComponent } from './deployment.component';

import { deploymentRoute } from './deployment.route';

@NgModule({
    imports: [GatewaySharedModule, RouterModule.forChild([deploymentRoute])],
    declarations: [DeploymentComponent]
})
export class DeploymentModule {}
