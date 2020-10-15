import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import * as moment from 'moment';
import { WeightclassService } from '../../services/weightclass.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-weightclass-new',
  templateUrl: './weightclass-new.component.html',
  styleUrls: ['./weightclass-new.component.scss']
})
export class WeightclassNewComponent implements OnInit {

  public contestForm: FormGroup;
  public submitted: boolean;
  public formError: any = {};
  public formSubmitted: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private weightclassService: WeightclassService,
  ) { }

  ngOnInit() {
    this.initContestForm();
  }
  initContestForm() {
    this.contestForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      minWeight: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]],
      maxWeight: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]],
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
        weight_class_name: this.f.name.value,
        max_weight: this.f.maxWeight.value,
        min_weight: this.f.minWeight.value,
      };

      this.formSubmitted = true;
      this.weightclassService.createWeightclass({ weightclass_details: formInputData }).pipe()
        .subscribe((res: any) => {
          this.formSubmitted = false;
          if (res.response_code == 200) {
            this.toastr.success(res.message || 'New Weight Class Created Sucessfully.');
            this.formError = '';
            this.router.navigate(['/weightclass']);
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


