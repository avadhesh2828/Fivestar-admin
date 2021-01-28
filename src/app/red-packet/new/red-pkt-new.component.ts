import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';

import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { formatDateTime, formatDate } from '../../services/utils.service';
import { SubscriptionService } from '../../services/subscription.service';
import { TranslateService } from '@ngx-translate/core';
import { RedpacketService } from 'src/app/services/redpacket.service';

@Component({
  selector: 'app-red-pkt-new',
  templateUrl: './red-pkt-new.component.html',
  styleUrls: ['./red-pkt-new.component.scss']
})
export class RedPktNewComponent implements OnInit {

  public newForm: FormGroup;
  formSubmitted = false;
  formError: any;
  submitted = false;
  maxChars = 200;
  remainChars: any = '';
  public error = false;
  public message: string;
  imgErrorMsg: any;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  public advPositionList = [];
  public stateList = [];
  public isSameAdd = false;
  public currentPosition = '';
  public buttonDisabled = true;

  constructor(
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private router: Router, private location: Location,
    public subscriptionService: SubscriptionService,
    public translate: TranslateService,
    public redpacketService: RedpacketService,
  ) {
    this.subscriptionService.language.subscribe((lang) => {
      this.translate.setDefaultLang(lang);  // this will happen on every change
    });
  }

  ngOnInit() {
    this.newForm = this.formBuilder.group({
      min: ['', [Validators.required]],
      max: ['', [Validators.required]],
      dropMinAmt: ['', [Validators.required]],
      dropMaxAmt: ['', [Validators.required]],
      dropRate: ['', [Validators.required]]
    });
  }

  goBack() {
    this.location.back();
  }

  // getting form control values
  get f() {
    return this.newForm.controls;
  }



  onSubmit() {
    this.submitted = true;
    if (this.newForm.invalid) {
      return;
    } else {
      const forminputdata = {
        'min': this.f.min.value,
        'max': this.f.max.value,
        'drop_min_amount': this.f.dropMinAmt.value,
        'drop_max_amount': this.f.dropMaxAmt.value,
        'drop_rates': this.f.dropRate.value,
        'games': ''
      };

      this.formSubmitted = true;

      this.redpacketService.createRedPkt(forminputdata).pipe()
        .subscribe((res: any) => {
          this.formSubmitted = false;
          if (res) {
            this.toastr.success(res.message || 'New Red Packet Created Sucessfully.');
            this.router.navigate(['/red-packet']);
            this.handleReset();

          }
        }, err => {
          const errorMessage = '';
          this.toastr.error(errorMessage || err.error.global_error || 'Some error occurred while creating new Red Packet.');
          this.formSubmitted = false;
        });
    }
  }

  handleReset() {
    this.newForm.reset();
    this.submitted = false;
    this.formSubmitted = false;
  }
}
