import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { encryptPassword } from '../services/utils.service';
import { ReCaptcha2Component } from 'ngx-captcha';
import { environment } from '../../environments/environment';
import { CustomValidators } from '../shared/validators/custom-validator';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  setPasswordForm: FormGroup;
  changePasswordForm: FormGroup;
  verifyPersonalPasswordForm: FormGroup;
  submitted = false;
  setPasswordSubmitted = false;
  changePasswordSubmitted = false;
  verifyPPasswordSubmitted = false;
  public readonly siteKey: string;
  enableRegister = false;
  captchaToken: string;
  logo: any;
  formType = 0;
  adminId: any;

  @ViewChild('captchaElem', { static: true }) captchaElem: ReCaptcha2Component;

  constructor(
    private authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder,
    private toastr: ToastrService
  ) {
    this.siteKey = environment.captchaSiteKey;
  }

  ngOnInit() {
    if (this.authService.isUserAuthenticated) {
      this.router.navigate(['/users']);
    } else {
      this.router.navigate(['/login']);
    }
    this.logo = environment.IMG_URL + '/logo.jpg';
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
      // recaptcha: ['', Validators.required]
    });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  get pf() {
    return this.setPasswordForm.controls;
  }

  get cpf() {
    return this.changePasswordForm.controls;
  }
  get ppf() {
    return this.verifyPersonalPasswordForm.controls;
  }

  handleSuccess(token: string) {
    this.enableRegister = true;
    this.captchaToken = token;
  }

  handleReset() {
    this.captchaToken = undefined;
  }

  onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }
    const data = {
      username: this.f.username.value,
      password: this.f.password.value,
      // password: encryptPassword(this.f.password.value),
      // captcha: this.captchaToken
    };
    this.authService.initialLogin(data)
      .subscribe((res: any) => {
        if (res.data && !res.data.status) {
          this.setPasswordForm = this.formBuilder.group({
            password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
            confirmPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
          }, { validator: CustomValidators.MatchPassword });
          this.adminId = res.data.admin_id;
          this.formType = 1; // set personal password
        } else {
          this.verifyPersonalPasswordForm = this.formBuilder.group({
            personalPassword: ['', [Validators.required]]
          });
          this.adminId = res.data.admin_id;
          this.formType = 3; // enter personal password
        }
      }, err => {
        // this.captchaElem.resetCaptcha();
        this.toastr.error('Error while login');
      });
  }

  errorExist(field: string, formName: string) {
    const error = this[formName][field].errors;
    if (error && (error.required || (typeof (error.minlength) || typeof (error.maxlength)) !== 'undefined')) {
      return true;
    } else {
      return false;
    }
  }

  onSubmitPassword() {
    this.setPasswordSubmitted = true;
    if (this.setPasswordForm.invalid) {
      return;
    }
    this.authService.setPersonalPassword({
      'admin_id': this.adminId,
      'security_password': this.pf.password.value,
      'security_password_confirmation': this.pf.confirmPassword.value
    }).subscribe((res) => {
      this.setPasswordSubmitted = false;
      this.changePasswordForm = this.formBuilder.group({
        oldPassword: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
        confirmPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
      }, { validators: CustomValidators.MatchPassword });
      this.formType = 2; // Chnage the password set by agent, create new
    }, err => {
      // this.captchaElem.resetCaptcha();
      this.toastr.error('Error while login');
    });
  }

  changePassword() {
    this.changePasswordSubmitted = true;
    if (this.changePasswordForm.invalid) {
      return;
    }
    this.authService.changePassword({
      'old_password': this.cpf.oldPassword.value,
      'password': this.cpf.password.value,
      'password_confirmation': this.cpf.confirmPassword.value
    }).subscribe((res: any) => {
      this.changePasswordSubmitted = false;
      this.toastr.success(res.message);
      this.formType = 0;
    }, err => {
      this.toastr.error(err.error.message);
    });
  }

  verifyPPassword() {
    this.verifyPPasswordSubmitted = true;
    if (this.verifyPersonalPasswordForm.invalid) {
      return;
    }
    this.authService.verifyPersonalPassword({
      'admin_id': this.adminId,
      'personal_password': this.ppf.personalPassword.value
    }).subscribe((res) => {
      this.verifyPPasswordSubmitted = false;
      this.router.navigate(['/users']);
    }, err => {
      this.toastr.error('Wrong Password');
    });
  }

}
