import { bootstrapApplication } from '@angular/platform-browser';

import App from './app/app';
import { appConfig } from './app/app.config';

import { environment } from 'environments/environment';

if(environment.TYPE.toLowerCase() === 'headless'){
  //Don't bootstrap Angular in headless mode
  // eslint-disable-next-line no-console
  console.info('Headless mode (No GUI)');
}else{
  bootstrapApplication(App, appConfig)
  .catch((err: unknown) => console.error(err)); // NOSONAR
}
