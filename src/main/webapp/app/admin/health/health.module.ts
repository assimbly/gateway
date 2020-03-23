import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GatewaySharedModule } from '../../../app/shared/shared.module';

// import { HealthComponent } from './health.component';
import { HealthModalComponent } from './health-modal.component';

import { healthRoute } from './health.route';

@NgModule({
    imports: [GatewaySharedModule, RouterModule.forChild([healthRoute])],
    declarations: [],
    entryComponents: [HealthModalComponent]
})
export class HealthModule {}
