import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl } from '@angular/forms';

@Directive({
    selector: '[jhiExistingLink]',
    providers: [{ provide: NG_VALIDATORS, useExisting: ForbiddenLinkValidatorDirective, multi: true }]
})
export class ForbiddenLinkValidatorDirective implements Validator {
    // tslint:disable-next-line:no-input-rename
    @Input('jhiExistingLink') existingKeys: Array<string>;

    validate(control: AbstractControl): { [key: string]: any } | null {
        return this.existingKeys.some(k => k === control.value) ? { existingLink: true } : null;
    }
}
