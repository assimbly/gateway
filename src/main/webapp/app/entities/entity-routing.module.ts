import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { BrokerModule } from './broker/broker.module';
import { CertificateModule } from './certificate/certificate.module';
import { StepModule } from './step/step.module';
import { LinkModule } from './link/link.module';
import { EnvironmentVariablesModule } from './environment-variables/environment-variables.module';
import { FlowModule } from './flow/flow.module';
import { IntegrationModule } from './integration/integration.module';
import { GroupModule } from './group/group.module';
import { MessageModule } from './message/message.module';
import { HeaderModule } from './header/header.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { QueueModule } from './queue/queue.module';
import { RouteModule } from './route/route.module';
import { ConnectionModule } from './connection/connection.module';
import { ConnectionKeysModule } from './connection-keys/connection-keys.module';
import { TopicModule } from './topic/topic.module';

import { DeploymentService } from 'app/admin/deployment/deployment.service';
/* jhipster-needle-add-entity-module-import - JHipster will add entity modules imports here */

@NgModule({
  // prettier-ignore
  imports: [
        BrokerModule,
		CertificateModule,
        StepModule,
        LinkModule,
		    EnvironmentVariablesModule,
		    FlowModule,
		    IntegrationModule,
        GroupModule,
        MessageModule,
        HeaderModule,
        MaintenanceModule,
		    QueueModule,
        RouteModule,
        ConnectionModule,
        ConnectionKeysModule,
		TopicModule,
        /* jhipster-needle-add-entity-module - JHipster will add entity modules here */
    ],
  exports: [
        BrokerModule,
		    CertificateModule,
        LinkModule,
        StepModule,
    		EnvironmentVariablesModule,
		    FlowModule,
	      IntegrationModule,
        GroupModule,
        MessageModule,
        HeaderModule,
        MaintenanceModule,
	      QueueModule,
        RouteModule,
        ConnectionModule,
        ConnectionKeysModule,
	    TopicModule,
    /* jhipster-needle-add-entity-module - JHipster will add entity modules here */
  ],
  declarations: [],
  entryComponents: [],
  providers: [DeploymentService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EntityRoutingModule {}
