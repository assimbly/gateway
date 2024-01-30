import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

import { DEBUG_INFO_ENABLED, TYPE } from './app/app.constants';
import { appConfig } from './app/app.config';
import AppComponent from './app/app.component';

// disable debug data on prod profile to improve performance
if (!DEBUG_INFO_ENABLED) {
  enableProdMode();
}

// disable debug data on prod profile to improve performance
if (!DEBUG_INFO_ENABLED) {
  enableProdMode();
}

if(TYPE.toLowerCase() === 'headless'){
  //Don't bootstrap Angular in headless mode
  console.log('Headless mode. Angular GUI not started')
}else{
  bootstrapApplication(AppComponent, appConfig)
    // eslint-disable-next-line no-console
    .then(() => console.log('Application started'))
    .catch(err => console.error(err));
}






