import { Route } from '@angular/router';

import { userRouteAccessService } from 'app/core/auth';

import Sessions from './sessions';

const sessionsRoute: Route = {
  path: 'sessions',
  component: Sessions,
  title: 'Sessions',
  canActivate: [userRouteAccessService],
};

export default sessionsRoute;
