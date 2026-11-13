import { Directive, input } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl } from '@angular/forms';

@Directive({
    selector: '[jhiExistingHeader]',
    providers: [{ provide: NG_VALIDATORS, useExisting: ForbiddenHeaderValidatorDirective, multi: true }]
})
export class ForbiddenHeaderValidatorDirective implements Validator {
    // tslint:disable-next-line:no-input-rename
    readonly existingHeaders = input.required<Array<string>>({ alias: 'jhiExistingHeader' });

    validate(control: AbstractControl): { [key: string]: any } | null {
        console.log('validating headers');
        const existingHeaders = this.existingHeaders();
        console.log(existingHeaders);

        return existingHeaders.some(k => k === control.value) ? { existingHeaderHeaders: true } : null;
    }
}
