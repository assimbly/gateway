import { Route } from '@angular/router';

import PasswordResetFinish from './password-reset-finish';

const passwordResetFinishRoute: Route = {
  path: 'reset/finish',
  component: PasswordResetFinish,
  title: 'Reset password',
};

export default passwordResetFinishRoute;
