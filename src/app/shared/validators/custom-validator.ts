import { AbstractControl, FormControl } from '@angular/forms';

export class CustomValidators {
  // check if password and confirmPassword fields match
  static MatchPassword(AC: AbstractControl) {
    const password = AC.get('password').value; // to get value in input tag
    const confirmPassword = AC.get('confirmPassword').value; // to get value in input tag
    if (password !== confirmPassword) {
      return { MatchPassword: true };
    } else {
      return null;
    }
  }
}
