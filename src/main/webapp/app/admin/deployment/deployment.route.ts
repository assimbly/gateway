import { Route } from '@angular/router';
import { DeploymentComponent } from './deployment.component';

export const deploymentRoute: Route = {
    path: '',
    component: DeploymentComponent,
    data: {
		pageTitle: 'global.title'
    }
};
