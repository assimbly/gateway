import { Route } from '@angular/router';

import { LogViewerComponent } from './logviewer.component';

export const logViewerRoute: Route = {
    path: 'logviewer',
    component: LogViewerComponent,
    data: {
        pageTitle: 'Log viewer'
    }
};
