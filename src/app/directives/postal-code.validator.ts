import { Directive, forwardRef } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  selector: '[postalCodeValidator]',
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PostalCodeValidatorDirective),
      multi: true,
    },
  ],
})
export class PostalCodeValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    const value = `${control.value || ''}`.trim();
    if (!value) {
      return null;
    }

    const valid = /^[0-9]{5}$/.test(value);
    return valid ? null : { postalCodeInvalid: true };
  }
}
