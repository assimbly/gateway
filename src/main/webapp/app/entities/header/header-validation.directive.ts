import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl } from '@angular/forms';

@Directive({
    selector: '[jhiExistingHeaderNames]',
    providers: [{ provide: NG_VALIDATORS, useExisting: ForbiddenHeaderNamesValidatorDirective, multi: true }]
})
export class ForbiddenHeaderNamesValidatorDirective implements Validator {
    // tslint:disable-next-line:no-input-rename
    @Input('jhiExistingHeaderNames') existingNames: Array<string>;

    validate(control: AbstractControl): { [key: string]: any } | null {
        return this.existingNames.some((k) => k === control.value) ? { 'existingHeaderName': true } : null;
    }
}
