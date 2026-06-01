import { Directive, forwardRef, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, NgForm, NgModel, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  selector: '[confirmEmailMatch]',
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ConfirmEmailMatchDirective),
      multi: true,
    },
  ],
})
export class ConfirmEmailMatchDirective implements Validator {
  @Input('confirmEmailMatch') matchTo = '';

  constructor(private ngModel: NgModel, private form: NgForm) {}

  validate(control: AbstractControl): ValidationErrors | null {
    if (!this.matchTo) {
      return null;
    }

    const otherControl = this.form.control.get(this.matchTo);
    if (!otherControl) {
      return null;
    }

    return control.value === otherControl.value ? null : { confirmEmailMatch: true };
  }
}
