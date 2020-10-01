import { Route } from '@angular/router';
import { DeploymentComponent } from 'app/admin';

export const deploymentRoute: Route = {
    path: 'deployment',
    component: DeploymentComponent,
    data: {
        pageTitle: 'Deployment'
    }
};
