import { AbstractControl, ValidatorFn } from '@angular/forms';

export function forbiddenEnvironmentKeysValidator(existingKeys: Array<string>): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        const value = (control.value ?? '').toString().trim().toLowerCase();
        if (!value) {
            return null;
        }
        return existingKeys.some(key => (key ?? '').trim().toLowerCase() === value) ? { existingKey: true } : null;
    };
}
