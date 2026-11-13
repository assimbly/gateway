import { Directive, input } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl } from '@angular/forms';

@Directive({
    selector: '[jhiExistingConnectionKeys]',
    providers: [{ provide: NG_VALIDATORS, useExisting: ForbiddenConnectionKeysValidatorDirective, multi: true }]
})
export class ForbiddenConnectionKeysValidatorDirective implements Validator {
    // tslint:disable-next-line:no-input-rename
    readonly existingKeys = input.required<Array<string>>({ alias: 'jhiExistingConnectionKeys' });

    validate(control: AbstractControl): { [key: string]: any } | null {
        return this.existingKeys().some(k => k === control.value) ? { existingConnectionKey: true } : null;
    }
}
