import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl } from '@angular/forms';

@Directive({
    selector: '[jhiExistingHeader]',
    providers: [{ provide: NG_VALIDATORS, useExisting: ForbiddenHeaderValidatorDirective, multi: true }]
})
export class ForbiddenHeaderValidatorDirective implements Validator {
    // tslint:disable-next-line:no-input-rename
    @Input('jhiExistingHeader') existingHeaders: Array<string>;

    validate(control: AbstractControl): { [key: string]: any } | null {
        console.log('validating headers');
        console.log(this.existingHeaders);

        return this.existingHeaders.some(k => k === control.value) ? { existingHeaderHeaders: true } : null;
    }
}
