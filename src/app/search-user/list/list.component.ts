import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { formatDateTime, formatDate } from '../../services/utils.service';
import { UserService } from 'src/app/services/user.service';


@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  public searchForm: FormGroup;
  formSubmitted = false;
  formError: any;
  submitted = false;
  public error = false;
  userList = [];
  showList = false;

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private userService: UserService,
  ) { }

  ngOnInit() {
    this.searchForm = this.formBuilder.group({
      'username': ['', [Validators.required]],
    });
  }

  get f() {
    return this.searchForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    if (this.searchForm.invalid || this.formError) {
      return;
    } else {
      const forminputdata = {
        'username': this.f.username.value,
      };
      this.formSubmitted = true;
      this.userService.searchUser(forminputdata).pipe()
        .subscribe((res: any) => {
          this.formSubmitted = false;
          this.showList = true;
          this.userList = res.data;
          this.toastr.success(res.message || 'User Found.');
        }, err => {
          const errorMessage = '';
          this.toastr.error(errorMessage || err.error.global_error || err.error.message || 'Some error occurred while fetching player login ip.');
          this.formSubmitted = false;
        });
    }
  }

  public changeUserStatus(userId: any, status: any){
    this.formSubmitted = true;
    const forminputdata = {
      status : status
    };    
    this.userService.changeUserStatus(userId, forminputdata).pipe()
      .subscribe((res: any) => {
        this.formSubmitted = false;
        this.toastr.success(res.message || 'User status changed Sucessfully.');
        this.onSubmit();
      }, err => {
        const errorMessage = '';
        this.toastr.error(errorMessage || err.error.global_error || err.error.message || 'Some error occurred while change agent status.');
        this.formSubmitted = false;
      });

  }

}