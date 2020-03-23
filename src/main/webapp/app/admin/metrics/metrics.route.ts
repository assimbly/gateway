import { Route } from '@angular/router';

import { MetricsComponent } from './metrics.component';

export const metricsRoute: Route = {
    path: 'jhi-metrics',
    component: MetricsComponent,
    data: {
        pageTitle: 'metrics.title'
    }
};
