import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { BrokerModule } from './broker/broker.module';
import { CertificateModule } from './certificate/certificate.module';
import { ConnectionModule } from './connection/connection.module';
import { ConnectionKeysModule } from './connection-keys/connection-keys.module';
import { EnvironmentVariablesModule } from './environment-variables/environment-variables.module';
import { FlowModule } from './flow/flow.module';
import { HeaderModule } from './header/header.module';
import { IntegrationModule } from './integration/integration.module';
import { LinkModule } from './link/link.module';
import { MessageModule } from './message/message.module';
import { QueueModule } from './queue/queue.module';
import { RouteModule } from './route/route.module';
import { StepModule } from './step/step.module';
import { TopicModule } from './topic/topic.module';

/* jhipster-needle-add-entity-module-import - JHipster will add entity modules imports here */

@NgModule({
  // prettier-ignore
  imports: [
        BrokerModule,
		    CertificateModule,
        ConnectionModule,
        ConnectionKeysModule,
		    EnvironmentVariablesModule,
		    FlowModule,
        HeaderModule,
		    IntegrationModule,
        LinkModule,
        MessageModule,
		    QueueModule,
        RouteModule,
        StepModule,
		    TopicModule,
        /* jhipster-needle-add-entity-module - JHipster will add entity modules here */
    ],
  exports: [
        BrokerModule,
		    CertificateModule,
        ConnectionModule,
        ConnectionKeysModule,
    		EnvironmentVariablesModule,
		    FlowModule,
        HeaderModule,
	      IntegrationModule,
        LinkModule,
        MessageModule,
	      QueueModule,
        RouteModule,
        StepModule,
	      TopicModule,
    /* jhipster-needle-add-entity-module - JHipster will add entity modules here */
  ],
  declarations: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EntityRoutingModule {}
