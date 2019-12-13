import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl } from '@angular/forms';

@Directive({
    selector: '[jhiExistingServiceKeys]',
    providers: [{ provide: NG_VALIDATORS, useExisting: ForbiddenServiceKeysValidatorDirective, multi: true }]
})
export class ForbiddenServiceKeysValidatorDirective implements Validator {
    // tslint:disable-next-line:no-input-rename
    @Input('jhiExistingServiceKeys') existingKeys: Array<string>;

    validate(control: AbstractControl): { [key: string]: any } | null {
        console.log('validating services');
        console.log(this.existingKeys);
        
        return this.existingKeys.some((k) => k === control.value) ? { 'existingServiceKey': true } : null;
    }
}
