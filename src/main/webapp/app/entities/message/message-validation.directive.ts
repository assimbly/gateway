import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl } from '@angular/forms';

@Directive({
    selector: '[jhiExistingMessageNames]',
    providers: [{ provide: NG_VALIDATORS, useExisting: ForbiddenMessageNamesValidatorDirective, multi: true }]
})
export class ForbiddenMessageNamesValidatorDirective implements Validator {
    // tslint:disable-next-line:no-input-rename
    @Input('jhiExistingMessageNames') existingMessageNames: Array<string>;

    validate(control: AbstractControl): { [key: string]: any } | null {
        return this.existingMessageNames.some(k => k === control.value) ? { existingMessageName: true } : null;
    }
}
