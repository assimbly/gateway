import { Route } from '@angular/router';

import { DeploymentComponent } from './deployment.component';

export const deploymentRoute: Route = {
    path: 'deployment',
    component: DeploymentComponent,
    data: {
        pageTitle: 'Deployment'
    }
};
