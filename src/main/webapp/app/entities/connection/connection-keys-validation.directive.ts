import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl } from '@angular/forms';

@Directive({
    standalone: false,
    selector: '[jhiExistingConnectionKeys]',
    providers: [{ provide: NG_VALIDATORS, useExisting: ForbiddenConnectionKeysValidatorDirective, multi: true }]
})
export class ForbiddenConnectionKeysValidatorDirective implements Validator {
    // tslint:disable-next-line:no-input-rename
    @Input('jhiExistingConnectionKeys') existingKeys: Array<string>;

    validate(control: AbstractControl): { [key: string]: any } | null {
        console.log('validating connections');
        console.log(this.existingKeys);

        return this.existingKeys.some(k => k === control.value) ? { existingConnectionKey: true } : null;
    }
}
