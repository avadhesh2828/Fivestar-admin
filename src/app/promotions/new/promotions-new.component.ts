import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import * as moment from 'moment';
import { PromotionService } from '../../services/promotion.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-promotions-new',
  templateUrl: './promotions-new.component.html',
  styleUrls: ['./promotions-new.component.scss']
})
export class PromotionsNewComponent implements OnInit {

  public contestForm: FormGroup;
  public submitted: boolean;
  public formError: any = {};
  public formSubmitted: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private promotionService: PromotionService,
  ) { }

  ngOnInit() {
    this.initContestForm();
  }
  initContestForm() {

    this.contestForm = this.formBuilder.group({
      promotionName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    });
  }

  onSubmit() {

    this.submitted = true;

    if (this.contestForm.invalid || Object.keys(this.formError).length > 0) {
        console.log(this.formError)
        console.log(this.contestForm)
      return;
    }
    else {
      const formInputData = {
        name: this.f.promotionName.value,
      };

      this.formSubmitted = true;
      this.promotionService.createPromotion({ promotion_details: formInputData }).pipe()
        .subscribe((res: any) => {
          this.formSubmitted = false;
          if (res.response_code == 200) {
            this.toastr.success(res.message || 'New Promotion Created Sucessfully.');
            this.formError = '';
            this.router.navigate(['/promotions']);
          }
        }, err => {
          let errorMessage = '';
          this.toastr.error(errorMessage || err.error.global_error || 'Some error occurred while creating new contest.');
          this.formSubmitted = false;
        });
    }
  }

  get f() {
    return this.contestForm.controls;
  }

}

