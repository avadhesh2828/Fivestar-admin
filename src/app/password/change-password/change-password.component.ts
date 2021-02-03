import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';
import { AgentService } from '../../services/agent.service';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { formatDateTime, formatDate } from '../../services/utils.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  public checkForm: FormGroup;
  formSubmitted = false;
  formError: any;
  submitted = false;
  public error = false;
  public message: string;
  constructor(
    private agentService: AgentService, 
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private router: Router
  ) { }

  ngOnInit() {
    const reg = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';
    const pattern = new RegExp(/^[a-zA-Z]([_@.&]?[a-zA-Z0-9 ]+)*$/);
    this.checkForm = this.formBuilder.group({
      'oldPassword': ['', [Validators.required, Validators.minLength(6), Validators.maxLength(50)]],
      'password': ['', [Validators.required, Validators.minLength(6), Validators.maxLength(50)]],
      'confirmPassword': ['', [Validators.required]]
    });
  }


  // getting form control values
  get f() {
    return this.checkForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    if (this.checkForm.invalid || this.formError) {
      return;
    } else {
      const forminputdata = {
        'old_password'         : this.f.oldPassword.value,
        'password'             : this.f.password.value,
        'password_confirmation': this.f.confirmPassword.value
      };
      this.formSubmitted = true;
      this.agentService.changePassword(forminputdata).pipe()
        .subscribe((res: any) => {
          this.formSubmitted = false;
          this.toastr.success(res.message || 'Password changed Sucessfully.');
          this.router.navigate(['/agent']);
        }, err => {
          const errorMessage = '';
          this.toastr.error(errorMessage || err.error.global_error || err.error.message || 'Some error occurred while changing password.');
          this.formSubmitted = false;
        });
    }
  }

  handleReset() {
    this.checkForm.reset();
    this.checkForm.controls['oldPassword'].setValue('');
    this.checkForm.controls['password'].setValue('');
    this.checkForm.controls['confirmPassword'].setValue('');
    this.submitted = false;
    this.formSubmitted = false;
  }

}