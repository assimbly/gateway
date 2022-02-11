import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GatewayModule } from './gateway/gateway.module';
import { EnvironmentVariablesModule } from './environment-variables/environment-variables.module';
import { ServiceModule } from './service/service.module';
import { ServiceKeysModule } from './service-keys/service-keys.module';
import { HeaderModule } from './header/header.module';
import { HeaderKeysModule } from './header-keys/header-keys.module';
import { EndpointModule } from './endpoint/endpoint.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { RouteModule } from './route/route.module';
import { SecurityModule } from './security/security.module';
import { BrokerModule } from './broker/broker.module';
import { QueueModule } from './queue/queue.module';
import { TopicModule } from './topic/topic.module';
import { GroupModule } from './group/group.module';
import { FlowModule } from './flow/flow.module';
import { DeploymentService } from 'app/admin/deployment/deployment.service';
/* jhipster-needle-add-entity-module-import - JHipster will add entity modules imports here */

@NgModule({
  // prettier-ignore
  imports: [
        GatewayModule,
        EnvironmentVariablesModule,
        FlowModule,
        ServiceModule,
        ServiceKeysModule,
        HeaderModule,
        HeaderKeysModule,
        EndpointModule,
        MaintenanceModule,
        SecurityModule,
        RouteModule,
        BrokerModule,
		QueueModule,
		TopicModule,
        GroupModule,
        /* jhipster-needle-add-entity-module - JHipster will add entity modules here */
    ],
  exports: [
    GatewayModule,
    FlowModule,
    EnvironmentVariablesModule,
    HeaderModule,
    HeaderKeysModule,
    ServiceModule,
    ServiceKeysModule,
    EndpointModule,
    MaintenanceModule,
    SecurityModule,
    RouteModule,
    BrokerModule,
    QueueModule,
    TopicModule,
    GroupModule,
    /* jhipster-needle-add-entity-module - JHipster will add entity modules here */
  ],
  declarations: [],
  entryComponents: [],
  providers: [DeploymentService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EntityRoutingModule {}
