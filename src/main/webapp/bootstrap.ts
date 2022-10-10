import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { DEBUG_INFO_ENABLED, TYPE } from './app/app.constants';
import { AppModule } from './app/app.module';

// disable debug data on prod profile to improve performance
if (!DEBUG_INFO_ENABLED) {
  enableProdMode();
}

if(TYPE.toLowerCase() === 'headless'){
  //Don't bootstrap Angular in headless mode
  console.log('type=' + TYPE)
}else{
  console.log('2. type=' + TYPE)
  platformBrowserDynamic()
    .bootstrapModule(AppModule, { preserveWhitespaces: true })
    // eslint-disable-next-line no-console
    .then(() => console.log('Application started'))
    .catch(err => console.error(err));

}
