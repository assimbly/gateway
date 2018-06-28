import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl } from '@angular/forms';

@Directive({
    selector: '[jhiExistingKeys]',
    providers: [{ provide: NG_VALIDATORS, useExisting: ForbiddenEnvironmentKeysValidatorDirective, multi: true }]
})
export class ForbiddenEnvironmentKeysValidatorDirective implements Validator {
    // tslint:disable-next-line:no-input-rename
    @Input('jhiExistingKeys') existingKeys: Array<string>;

    validate(control: AbstractControl): { [key: string]: any } | null {
        return this.existingKeys.some((k) => k === control.value) ? { 'existingKey': true } : null;
    }
}
