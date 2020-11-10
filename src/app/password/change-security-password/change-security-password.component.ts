import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';
import { AgentService } from '../../services/agent.service';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { formatDateTime, formatDate } from '../../services/utils.service';

@Component({
  selector: 'app-change-security-password',
  templateUrl: './change-security-password.component.html',
  styleUrls: ['./change-security-password.component.scss']
})
export class ChangeSecurityPasswordComponent implements OnInit {
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
    this.checkForm = this.formBuilder.group({
      'oldSecurityPassword': ['', [Validators.required, Validators.minLength(6), Validators.maxLength(50)]],
      'securityPassword': ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
      'confirmSecurityPassword': ['', [Validators.required]]
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
          'old_security_password'         : this.f.oldSecurityPassword.value,
          'security_password'             : this.f.securityPassword.value,
          'security_password_confirmation': this.f.confirmSecurityPassword.value
        };
        this.formSubmitted = true;
        this.agentService.changeSecurityPassword(forminputdata).pipe()
          .subscribe((res: any) => {
            this.formSubmitted = false;
            this.toastr.success(res.message || 'Security Password changed Sucessfully.');
            this.router.navigate(['/agent']);
          }, err => {
            const errorMessage = '';
            this.toastr.error(errorMessage || err.error.global_error || err.error.message || 'Some error occurred while changing sucurity password.');
            this.formSubmitted = false;
          });
      }
    }
  
    handleReset() {
      this.checkForm.reset();
      this.checkForm.controls['oldSecurityPassword'].setValue('');
      this.checkForm.controls['securityPassword'].setValue('');
      this.checkForm.controls['confirmSecurityPassword'].setValue('');
      this.submitted = false;
      this.formSubmitted = false;
    }


}