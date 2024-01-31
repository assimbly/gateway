import { AbstractControl, ValidatorFn } from '@angular/forms';

export function forbiddenEnvironmentKeysValidator(existingKeys: Array<string>): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        return existingKeys.some(k => k === control.value) ? { existingKey: true } : null;
    };
}
