import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl } from '@angular/forms';

@Directive({
  standalone: false,
  selector: '[jhiExistingRouteNames]',
  providers: [{ provide: NG_VALIDATORS, useExisting: ForbiddenRouteNamesValidatorDirective, multi: true }]
})
export class ForbiddenRouteNamesValidatorDirective implements Validator {
    // tslint:disable-next-line:no-input-rename
    @Input('jhiExistingRouteNames') existingNames: Array<string>;

    validate(control: AbstractControl): { [key: string]: any } | null {
        return this.existingNames.some(k => k === control.value) ? { existingRouteName: true } : null;
    }
}
