import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl } from '@angular/forms';

@Directive({
    selector: '[jhiExistingServiceNames]',
    providers: [{ provide: NG_VALIDATORS, useExisting: ForbiddenServiceNamesValidatorDirective, multi: true }]
})
export class ForbiddenServiceNamesValidatorDirective implements Validator {
    // tslint:disable-next-line:no-input-rename
    @Input('jhiExistingServiceNames') existingNames: Array<string>;

    validate(control: AbstractControl): { [key: string]: any } | null {
        return this.existingNames.some(k => k === control.value) ? { existingServiceName: true } : null;
    }
}
