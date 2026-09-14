import { MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';

import { agentDebugLog } from 'app/core/util/agent-debug-log';

export const translationNotFoundMessage = 'translation-not-found';

export class MissingTranslationHandlerImpl implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams): string {
    const { key } = params;
    // #region agent log
    if (key === 'login.title' || key === 'global.form.username.label') {
      agentDebugLog({
        runId: 'post-fix',
        hypothesisId: 'D',
        location: 'translation.config.ts:missing',
        message: 'missing translation key',
        data: { key },
      });
    }
    // #endregion
    return `${translationNotFoundMessage}[${key}]`;
  }
}

export function missingTranslationHandler(): MissingTranslationHandler {
  return new MissingTranslationHandlerImpl();
}
