import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { encryptPassword } from '../services/utils.service';
import { ReCaptcha2Component } from 'ngx-captcha';
import { environment } from '../../environments/environment';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    submitted = false;
    public readonly siteKey: string;
    enableRegister = false;
    captchaToken: string;
    logo: any;

    @ViewChild('captchaElem', {static: true}) captchaElem: ReCaptcha2Component;

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
            this.router.navigate(['/dashboard']);
        } else {
            this.router.navigate(['/login']);
        }
        this.logo = environment.IMG_URL+'/logo.jpg'
        this.loginForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
            // recaptcha: ['', Validators.required]
        });
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.loginForm.controls;
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
            email: this.f.email.value,
            password: this.f.password.value,
            // password: encryptPassword(this.f.password.value),
            captcha: this.captchaToken
        };
        this.authService.login(data).pipe(first())
            .subscribe(() => {
                this.router.navigate(['/dashboard']);
            }, err => {
                this.toastr.error(err.error.error.email);
                // this.captchaElem.resetCaptcha();
                console.log('login component error ', err);
            });
    }

}
