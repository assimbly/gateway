import { Route } from '@angular/router';

import { LogViewerComponent } from './log-viewer.component';

export const logViewerRoute: Route = {
    path: 'log-viewer',
    component: LogViewerComponent,
    data: {
        pageTitle: 'Log viewer'
    }
};
