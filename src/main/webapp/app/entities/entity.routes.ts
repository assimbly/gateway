import { Routes } from '@angular/router';

import { brokerRoute } from './broker/broker.route';
import { certificateRoute } from './certificate/certificate.route';
import { environmentVariablesRoute } from './environment-variables/environment-variables.route';
import { integrationRoute } from './integration/integration.route';

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
  // jhipster-needle-add-entity-route - JHipster will add entity modules routes here
];

export default routes;
