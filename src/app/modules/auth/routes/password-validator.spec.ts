import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { mustMatch } from './password-validator';

describe('mustMatch validator', () => {
    let formGroup: UntypedFormGroup;

    beforeEach(() => {
        formGroup = new UntypedFormGroup({
            password: new UntypedFormControl(''),
            confirmPassword: new UntypedFormControl('')
        });
    });

    it('should set mustMatch error if values do not match', () => {
        formGroup.controls['password'].setValue('password1');
        formGroup.controls['confirmPassword'].setValue('password2');

        mustMatch('password', 'confirmPassword')(formGroup);

        expect(formGroup.controls['confirmPassword'].errors).toEqual({ mustMatch: true });
    });

    it('should not set error if values match', () => {
        formGroup.controls['password'].setValue('password123');
        formGroup.controls['confirmPassword'].setValue('password123');

        mustMatch('password', 'confirmPassword')(formGroup);

        expect(formGroup.controls['confirmPassword'].errors).toBeNull();
    });

    it('should not overwrite other errors on matchingControl', () => {
        formGroup.controls['password'].setValue('password1');
        formGroup.controls['confirmPassword'].setValue('password2');
        formGroup.controls['confirmPassword'].setErrors({ required: true });

        mustMatch('password', 'confirmPassword')(formGroup);

        expect(formGroup.controls['confirmPassword'].errors).toEqual({ required: true });
    });

    it('should remove mustMatch error when values become equal', () => {
        formGroup.controls['password'].setValue('abc');
        formGroup.controls['confirmPassword'].setValue('def');
        mustMatch('password', 'confirmPassword')(formGroup);
        expect(formGroup.controls['confirmPassword'].errors).toEqual({ mustMatch: true });

        formGroup.controls['confirmPassword'].setValue('abc');
        mustMatch('password', 'confirmPassword')(formGroup);
        expect(formGroup.controls['confirmPassword'].errors).toBeNull();
    });
});
