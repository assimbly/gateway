import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl } from '@angular/forms';

@Directive({
    selector: '[jhiLogViewerLineValidation]',
    providers: [{ provide: NG_VALIDATORS, useExisting: LogViewerLineValidationDirective, multi: true }]
})
export class LogViewerLineValidationDirective implements Validator {
    // tslint:disable-next-line:no-input-rename
    @Input('jhiLogViewerLineValidation') line: number;

    validate(control: AbstractControl): { [key: string]: any } | null {
        return this.line < 1 || this.line > 10000 ? { lineOutScope: true } : null;
    }
}
