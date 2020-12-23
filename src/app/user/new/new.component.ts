import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { LoaderService } from '../../shared/loader/loader.service';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';
import { SubscriptionService } from '../../services/subscription.service';

@Component({
  selector: 'app-new',
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.scss']
})
export class NewComponent implements OnInit {

  public newAgentForm: FormGroup;
  formSubmitted = false;
  formError: any;
  submitted = false;
  maxChars = 200;
  remainChars: any = '';
  public error = false;
  minDate: Date;
  public imagePath;
  imgURL: any;
  imgPath: any;
  public message: string;
  maxBalance: any;
  userAgent: any;
  public unique_username:any;

  // public show:boolean = false;
  public isSameAdd = false;

  constructor(
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,
    private authService: AuthService,
    public translate: TranslateService,
    public subscriptionService: SubscriptionService,
    private loaderService: LoaderService,
  ) { 
    this.subscriptionService.language.subscribe((lang) => {
      this.translate.setDefaultLang(lang);  // this will happen on every change
    });
  }

  ngOnInit() {
    this.getUniqueUserName();
    
    const pattern = /^[a-zA-Z]([_@.&]?[a-zA-Z0-9 ]+)*$/;
    this.userService.currentUser.subscribe((usr: any) => {
      // this.maxBalance =  usr.balance;
      this.maxBalance = (usr.role_id == 1)? '':usr.balance;
      this.userAgent = usr.username;
      this.minDate = new Date();
      this.newAgentForm = this.formBuilder.group({
        // checkadd:[''],
        // 'username': ['', [Validators.required, Validators.minLength(7), Validators.maxLength(50), Validators.pattern(pattern)]],
        'password': ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
        // 'password': ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20),
        // Validators.pattern('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/')]],
        'score': [0, [Validators.required, Validators.max(this.maxBalance)]],
        'name': ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
        'phone': ['', [Validators.required, Validators.minLength(1), Validators.maxLength(10)]],
        'description': [''],
      });
    });
  }


  private getUniqueUserName() {
    this.loaderService.display(true);
    this.userService.getUniquePlayerUserName()
      .subscribe((dat) => {
        this.loaderService.display(false);
        if (dat['data']) {
          this.unique_username = dat['data']; 
        }
      }, (err: object) => {
        this.loaderService.display(false);
        this.error = true;
      });
  }

  // getting form control values
  get f() {
    return this.newAgentForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    if (this.newAgentForm.invalid || this.formError) {
      return;
    } else {
      const forminputdata = {
        'username': this.unique_username,
        'password': this.f.password.value,
        'score': this.f.score.value,
        'name': this.f.name.value,
        'phone': this.f.phone.value,
        'description': this.f.description.value
      };

      this.formSubmitted = true;

      this.userService.createNewPlayer(forminputdata).pipe()
        .subscribe((res: any) => {
          this.formSubmitted = false;
          this.toastr.success(res.message || 'New Player Created Sucessfully.');
          this.handleReset();
          this.authService.getUserDetails().subscribe((usr: any) => {
            this.userService.updateUser(usr.data);
          });
          this.router.navigate(['/agent']);
        }, err => {
          const errorMessage = '';
          this.toastr.error(errorMessage || err.error.global_error || err.error.message || 'Some error occurred while creating new Agent.');
          this.formSubmitted = false;
        });
    }
  }

  handleReset() {
    this.newAgentForm.reset();
    // this.newAgentForm.controls['username'].setValue('');
    this.newAgentForm.controls['password'].setValue('');
    this.newAgentForm.controls['score'].setValue('0');
    this.newAgentForm.controls['name'].setValue('');
    this.newAgentForm.controls['phone'].setValue('');
    this.newAgentForm.controls['description'].setValue('');
    this.submitted = false;
    this.formSubmitted = false;
  }
}
