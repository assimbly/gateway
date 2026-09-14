import { EnvironmentProviders, Provider, inject, provideAppInitializer } from '@angular/core';

import { MissingTranslationHandler, TranslateService, provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { missingTranslationHandler } from 'app/config';
import { StateStorageService } from 'app/core/auth';
import { agentDebugLog } from 'app/core/util/agent-debug-log';

export function provideTranslation(): (Provider | EnvironmentProviders)[] {
  return [
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        resources: [{ prefix: './i18n/', suffix: `.json?_=${I18N_HASH}` }],
      }),
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useFactory: missingTranslationHandler,
      },
    }),
    provideAppInitializer(() => {
      const translateService = inject(TranslateService);
      const stateStorageService = inject(StateStorageService);
      translateService.setFallbackLang('en');
      // if the user has changed the language and navigates away from the application and back to it, then use the previously chosen language
      const langKey = stateStorageService.getLocale() ?? 'en';
      // #region agent log
      agentDebugLog({
        runId: 'post-fix',
        hypothesisId: 'C',
        location: 'translation.provider.ts:init',
        message: 'calling translateService.use',
        data: { langKey, i18nHash: typeof I18N_HASH !== 'undefined' ? I18N_HASH : null },
      });
      // #endregion
      translateService.use(langKey).subscribe({
        next: translations => {
          // #region agent log
          agentDebugLog({
            runId: 'post-fix',
            hypothesisId: 'C',
            location: 'translation.provider.ts:use-success',
            message: 'translations loaded',
            data: {
              langKey,
              keyCount: translations && typeof translations === 'object' ? Object.keys(translations).length : 0,
              hasLoginTitle:
                !!(translations as Record<string, unknown>)?.['login'] ||
                JSON.stringify(translations ?? {}).includes('login'),
            },
          });
          // #endregion
        },
        error: err => {
          // #region agent log
          agentDebugLog({
            runId: 'post-fix',
            hypothesisId: 'C',
            location: 'translation.provider.ts:use-error',
            message: 'translations failed to load',
            data: { langKey, status: err?.status, url: err?.url, message: err?.message },
          });
          // #endregion
        },
      });
    }),
  ];
}
