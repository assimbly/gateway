import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl } from '@angular/forms';

@Directive({
    selector: '[jhiExistingHeaderKeys]',
    providers: [{ provide: NG_VALIDATORS, useExisting: ForbiddenHeaderKeysValidatorDirective, multi: true }]
})
export class ForbiddenHeaderKeysValidatorDirective implements Validator {
    // tslint:disable-next-line:no-input-rename
    @Input('jhiExistingHeaderKeys') existingKeys: Array<string>;

    validate(control: AbstractControl): { [key: string]: any } | null {
        console.log('validating headers');
        console.log(this.existingKeys);

        return this.existingKeys.some(k => k === control.value) ? { existingHeaderKeys: true } : null;
    }
}
