import { Routes } from '@angular/router';

import { brokerRoute } from './broker/broker.route';
import { certificateRoute } from './certificate/certificate.route';
import { connectionRoute } from './connection/connection.route';
import { environmentVariablesRoute } from './environment-variables/environment-variables.route';
import flowRoute from './flow/flow.route';
import { integrationRoute } from './integration/integration.route';
import { messageRoute } from './message/message.route';
import { queueRoute } from './queue/queue.route';
import { routeRoute } from './route/route.route';
import { topicRoute } from './topic/topic.route';

const routes: Routes = [
  {
    path: 'user-management',
    title: 'userManagement.home.title',
    loadChildren: () => import('./admin/user-management/user-management.routes'),
  },
  {
    path: 'authority',
    title: 'jhipsterGradleSampleApplicationApp.adminAuthority.home.title',
    loadChildren: () => import('./admin/authority/authority.routes'),
  },
  // Navbar Assimbly entities (orphaned after JHipster 9 standalone router migration)
  ...brokerRoute,
  ...certificateRoute,
  ...environmentVariablesRoute,
  ...integrationRoute,
  ...queueRoute,
  ...topicRoute,
  ...flowRoute,
  ...connectionRoute,
  ...messageRoute,
  ...routeRoute,
  { path: 'topics', redirectTo: '/topic', pathMatch: 'full' },
  { path: 'queues', redirectTo: '/queue', pathMatch: 'full' },
  // jhipster-needle-add-entity-route - JHipster will add entity modules routes here
];

export default routes;
