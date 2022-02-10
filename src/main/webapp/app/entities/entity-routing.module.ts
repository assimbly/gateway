import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GatewayGatewayModule } from './gateway/gateway.module';
import { GatewayEnvironmentVariablesModule } from './environment-variables/environment-variables.module';
import { GatewayServiceModule } from './service/service.module';
import { GatewayServiceKeysModule } from './service-keys/service-keys.module';
import { GatewayHeaderModule } from './header/header.module';
import { GatewayHeaderKeysModule } from './header-keys/header-keys.module';
import { GatewayEndpointModule } from './endpoint/endpoint.module';
import { GatewayMaintenanceModule } from './maintenance/maintenance.module';
import { GatewayRouteModule } from './route/route.module';
import { GatewaySecurityModule } from './security/security.module';
import { GatewayBrokerModule } from './broker/broker.module';
import { GatewayQueueModule } from './queue/queue.module';
import { GatewayTopicModule } from './topic/topic.module';
import { GatewayGroupModule } from './group/group.module';
import { GatewayFlowModule } from './flow/flow.module';
import { DeploymentService } from 'app/admin/deployment/deployment.service';
/* jhipster-needle-add-entity-module-import - JHipster will add entity modules imports here */

@NgModule({
  // prettier-ignore
  imports: [
        GatewayGatewayModule,
        GatewayEnvironmentVariablesModule,
        GatewayFlowModule,
        GatewayServiceModule,
        GatewayServiceKeysModule,
        GatewayHeaderModule,
        GatewayHeaderKeysModule,
        GatewayEndpointModule,
        GatewayMaintenanceModule,
        GatewaySecurityModule,
        GatewayRouteModule,
        GatewayBrokerModule,
		GatewayQueueModule,
		GatewayTopicModule,
        GatewayGroupModule,
        /* jhipster-needle-add-entity-module - JHipster will add entity modules here */
    ],
  exports: [
    GatewayGatewayModule,
    GatewayFlowModule,
    GatewayEnvironmentVariablesModule,
    GatewayHeaderModule,
    GatewayHeaderKeysModule,
    GatewayServiceModule,
    GatewayServiceKeysModule,
    GatewayEndpointModule,
    GatewayMaintenanceModule,
    GatewaySecurityModule,
    GatewayRouteModule,
    GatewayBrokerModule,
    GatewayQueueModule,
    GatewayTopicModule,
    GatewayGroupModule,
    /* jhipster-needle-add-entity-module - JHipster will add entity modules here */
  ],
  declarations: [],
  entryComponents: [],
  providers: [DeploymentService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EntityRoutingModule {}
