import { bootstrapApplication } from '@angular/platform-browser';

import App from './app/app';
import { appConfig } from './app/app.config';

import { environment } from 'environments/environment';

console.log('Application type: ' + environment.TYPE);

if(environment.TYPE.toLowerCase() === 'headless'){
  //Don't bootstrap Angular in headless mode
  console.log('Headless mode (No GUI)');
}else{
  bootstrapApplication(App, appConfig)
  // eslint-disable-next-line no-console
  .then(() => console.log('Application started'))
  .catch((err: unknown) => console.error(err)); // NOSONAR
}






