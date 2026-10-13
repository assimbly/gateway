import { Routes } from '@angular/router';

import { userRouteAccessService } from 'app/core/auth';

import { ImportCamelComponent } from './import-camel.component';
import { ImportFlowComponent } from './import-flow.component';
import { ImportScriptComponent } from './import-script.component';
import { ImportComponent } from './import.component';

const adminOnly = { authorities: ['ROLE_ADMIN'], pageTitle: 'global.title' };

export const importRoute: Routes = [
  { path: 'import', component: ImportComponent, data: adminOnly, canActivate: [userRouteAccessService] },
  { path: 'import/flow', component: ImportFlowComponent, data: adminOnly, canActivate: [userRouteAccessService] },
  { path: 'import/camel', component: ImportCamelComponent, data: adminOnly, canActivate: [userRouteAccessService] },
  { path: 'import/script', component: ImportScriptComponent, data: adminOnly, canActivate: [userRouteAccessService] },
];
