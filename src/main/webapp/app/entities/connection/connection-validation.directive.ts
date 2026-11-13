import { Directive, input } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl } from '@angular/forms';

@Directive({
    selector: '[jhiExistingConnectionNames]',
    providers: [{ provide: NG_VALIDATORS, useExisting: ForbiddenConnectionNamesValidatorDirective, multi: true }]
})
export class ForbiddenConnectionNamesValidatorDirective implements Validator {
    // tslint:disable-next-line:no-input-rename
    readonly existingNames = input.required<Array<string>>({ alias: 'jhiExistingConnectionNames' });

    validate(control: AbstractControl): { [key: string]: any } | null {
        return this.existingNames().some(k => k === control.value) ? { existingConnectionName: true } : null;
    }
}
