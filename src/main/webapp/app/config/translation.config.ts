import { MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';

export const translationNotFoundMessage = 'translation-not-found';

export class MissingTranslationHandlerImpl implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams): string {
    const { key } = params;
    return `${translationNotFoundMessage}[${key}]`;
  }
}

export function missingTranslationHandler(): MissingTranslationHandler {
  return new MissingTranslationHandlerImpl();
}
