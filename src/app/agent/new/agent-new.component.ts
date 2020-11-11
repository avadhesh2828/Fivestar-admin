import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import { AgentService } from '../../services/agent.service';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { formatDateTime, formatDate } from '../../services/utils.service';
import { KYC_TYPE, KYC_STATUS, COMMISSION_TYPE } from '../constants';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';
import { SubscriptionService } from '../../services/subscription.service';

@Component({
  selector: 'app-agent-new',
  templateUrl: './agent-new.component.html',
  styleUrls: ['./agent-new.component.scss']
})
export class AgentNewComponent implements OnInit {

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
  imgErrorMsg: any;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  maxBalance: any;
  public countryList = [];
  public kycType = KYC_TYPE;
  public kycStatus = KYC_STATUS;
  public commissionType = COMMISSION_TYPE;
  public stateList = [];
  // public show:boolean = false;
  public isSameAdd = false;

  constructor(
    private agentService: AgentService, private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,
    private authService: AuthService,
    public translate: TranslateService,
    public subscriptionService: SubscriptionService
  ) { }

  ngOnInit() {
    // this.getCountryList();
    this.subscriptionService.language.subscribe((lang) => {
      this.translate.setDefaultLang(lang);  // this will happen on every change
    });
    const reg = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';
    const pattern = /^[a-zA-Z]([_@.&]?[a-zA-Z0-9 ]+)*$/;
    this.userService.currentUser.subscribe((usr: any) => {
      this.maxBalance = usr.balance;
      this.minDate = new Date();
      this.newAgentForm = this.formBuilder.group({
        // agentName: ['',   [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(pattern)]],
        // email:    ['',   [Validators.required,
        // Validators.pattern(new RegExp('^([a-z0-9\\+_\\-]+)(\\.[a-z0-9\\+_\\-]+)*@([a-z0-9\\-]+\\.)+[a-z]{2,6}$', 'i'))]],
        // phone_number:   ['', [Validators.required, Validators.minLength(5), Validators.maxLength(15)]],
        // website:['',[Validators.maxLength(100),Validators.pattern(reg)]],
        // address:['',[Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
        // country:  ['160',   [Validators.required]],
        // state:    ['',   [Validators.required]],
        // city:     ['',   [Validators.required, Validators.minLength(3), Validators.maxLength(30), Validators.pattern('^[a-zA-Z \-\']+')]],
        // pincode: ['',   [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
        // business_address:['',[Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
        // business_country:  ['160',   [Validators.required]],
        // business_state:    ['',   [Validators.required]],
        // business_city:     ['',   [Validators.required, Validators.minLength(3), Validators.maxLength(30), Validators.pattern('^[a-zA-Z \-\']+')]],
        // business_pincode: ['',   [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
        // kyc_type: ['',   [Validators.required]],
        // commission_type: ['0',   [Validators.required]],
        // commission_amount: ['1',   [Validators.required]],
        // agent_proof_image:['',[Validators.required]],
        // checkadd:[''],
        'username': ['', [Validators.required, Validators.minLength(7), Validators.maxLength(50), Validators.pattern(pattern)]],
        'password': ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
        // 'password': ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20),
        // Validators.pattern('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/')]],
        'score': [0, [Validators.required, Validators.max(this.maxBalance)]],
        'name': ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
        'phone': ['', [Validators.minLength(5), Validators.maxLength(15)]],
        'description': ['', [Validators.minLength(5), Validators.maxLength(200)]],
      });
    });
    // this.getStateList();
  }

  public getCountryList() {
    this.agentService.getCountryList()
      .subscribe((response: any) => {
        this.countryList = response.result;
      }, (err: Error) => {
        this.toastr.error(err.message || 'There was an error.');
        this.error = true;
      });
  }

  public getStateList() {
    this.agentService.getStateList({ country_id: this.f.country.value })
      .subscribe((response: any) => {
        this.stateList = response.result;
      }, (err: Error) => {
        this.stateList = [];
        /*this.toastr.error(err.message || 'There was an error.');
        this.error = true;*/
      });
  }



  initLink() {
    return this.formBuilder.group({
      consolationPrize: ['']
    });
  }

  addNewField() {
    // add new consolation prize field to the list
    const control = <FormArray>this.newAgentForm.controls['consolationPrizes'];
    control.push(this.initLink());
  }

  removeField(i: number) {
    // remove address from the list
    const control = <FormArray>this.newAgentForm.controls['consolationPrizes'];
    control.removeAt(i);
  }

  // getting form control values
  get f() {
    return this.newAgentForm.controls;
  }

  preview(files) {
    if (files.length === 0) {
      return;
    }

    const mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.imgErrorMsg = 'Only images files are supported.';
      this.newAgentForm.controls['agent_proof_image'].setValue('');
      this.formSubmitted = false;
      return;
    }

    const reader = new FileReader();
    this.imagePath = files;
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
      this.imgURL = reader.result;
    };
  }

  checkaddress(event) {
    if (event.target.checked) {

      this.f.business_address.setValue(this.f.address.value);
      this.f.business_country.setValue(this.f.country.value);
      this.f.business_state.setValue(this.f.state.value);
      this.f.business_city.setValue(this.f.city.value);
      this.f.business_pincode.setValue(this.f.pincode.value);

      // disable business address field

      this.f.business_address.disable();
      this.f.business_country.disable();
      this.f.business_state.disable();
      this.f.business_city.disable();
      this.f.business_pincode.disable();


      // disable street address field

      this.f.address.disable();
      this.f.country.disable();
      this.f.state.disable();
      this.f.city.disable();
      this.f.pincode.disable();


    } else {

      this.f.business_address.reset();
      this.f.business_country.setValue('160');
      this.f.business_state.setValue('');
      this.f.business_city.reset();
      this.f.business_pincode.reset();

      // enable business adress
      this.f.business_address.enable();
      this.f.business_country.enable();
      this.f.business_state.enable();
      this.f.business_city.enable();
      this.f.business_pincode.enable();


      // enable street address
      this.f.address.enable();
      this.f.country.enable();
      this.f.state.enable();
      this.f.city.enable();
      this.f.pincode.enable();
    }
  }


  checkcommissionAmount(event) {
    if (!this.f.commission_type.value) {
      this.formError = 'Please select the commission type first.';
      this.formSubmitted = false;
    } else if (this.f.commission_type.value === 1 && (event.target.value > 100)) {
      this.formError = 'You can\'t provide more than 100% commission amount.Please select fixed commission type instead.';
      this.formSubmitted = false;
    } else if (this.f.commission_type.value === 0 && (event.target.value < 1 || event.target.value > 9999999999)) {
      this.formError = 'Commission amount must be 1 or between 1 to 9999999999.';
      this.formSubmitted = false;
    } else {
      this.formError = '';
      this.formSubmitted = true;
      return;
    }
  }

  onSubmit() {
    this.submitted = true;
    if (this.newAgentForm.invalid || this.formError) {
      return;
    } else {
      const forminputdata = {
        'username': this.f.username.value,
        'password': this.f.password.value,
        'score': this.f.score.value,
        'name': this.f.name.value,
        'phone': this.f.phone.value,
        'description': this.f.description.value
      };

      this.formSubmitted = true;

      this.agentService.createAgent(forminputdata).pipe()
        .subscribe((res: any) => {
          this.formSubmitted = false;
          this.toastr.success(res.message || 'New Agent Created Sucessfully.');
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
    this.newAgentForm.controls['username'].setValue('');
    this.newAgentForm.controls['password'].setValue('');
    this.newAgentForm.controls['score'].setValue('0');
    this.newAgentForm.controls['name'].setValue('');
    this.newAgentForm.controls['phone'].setValue('');
    this.newAgentForm.controls['description'].setValue('');
    this.submitted = false;
    this.formSubmitted = false;
  }

  fileChangeEvent(event: any): void {
    this.imgURL = event.target.value;
    /*this.imageChangedEvent = event;*/
  }
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }
  imageLoaded() {
    // show cropper
  }
  cropperReady() {
    // cropper ready
  }
  loadImageFailed() {
    // show message
  }
}
