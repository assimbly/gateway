import { Route } from '@angular/router';

import PasswordResetFinish from './password-reset-finish';

const passwordResetFinishRoute: Route = {
  path: 'reset/finish',
  component: PasswordResetFinish,
  title: 'global.menu.account.password',
};

export default passwordResetFinishRoute;
