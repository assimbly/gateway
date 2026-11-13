import { Directive, input } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl } from '@angular/forms';

@Directive({
  standalone: true,
    selector: '[jhiLogViewerLineValidation]',
    providers: [{ provide: NG_VALIDATORS, useExisting: LogViewerLineValidationDirective, multi: true }]
})
export class LogViewerLineValidationDirective implements Validator {
    // tslint:disable-next-line:no-input-rename
    readonly line = input.required<number>({ alias: 'jhiLogViewerLineValidation' });

    validate(control: AbstractControl): { [key: string]: any } | null {
        return this.line() < 1 || this.line() > 10000 ? { lineOutScope: true } : null;
    }
}
