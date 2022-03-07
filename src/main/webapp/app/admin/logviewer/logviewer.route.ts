import { Route } from '@angular/router';

import { LogViewerComponent } from './logviewer.component';

export const logViewerRoute: Route = {
    path: '',
    component: LogViewerComponent,
    data: {
		pageTitle: 'global.title'
    }
};
