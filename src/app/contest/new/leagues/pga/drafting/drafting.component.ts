import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as moment from 'moment';

@Component({
  selector: 'app-new-contest-drafting',
  templateUrl: './drafting.component.html',
  styleUrls: ['./drafting.component.scss']
})
export class DraftingComponent implements OnInit {

  @Input() parentFormGroup: FormGroup;
  @Input() submitted: boolean;
  @Input() formError: any;

  public lineupStyles = { 'standard': 18, 'superflex': 24 };
  public draftTime = '';
  public draftMinDate: any = new Date();
  public draftMaxDate: any;
  public showDraftDateField = false;
  constructor() { }

  ngOnInit() {
    this.parentFormGroup.addControl('lineupStyle', new FormControl('', Validators.required));
    this.parentFormGroup.addControl('draftType', new FormControl(1, Validators.required));
    this.parentFormGroup.addControl('whenToDraft', new FormControl('', Validators.required));
    this.parentFormGroup.addControl('projectedDraftingEndDate', new FormControl('', Validators.required));
    this.parentFormGroup.addControl('draftSpeed', new FormControl('', Validators.required));
  }

  get f() {
    return this.parentFormGroup.controls;
  }

  resetDraftDate() {
    this.f.whenToDraft.setValue('');
    this.f.projectedDraftingEndDate.setValue('');
  }

  initDraftDateTimeField(event: any) {

    let minDate: any = '';

    if (this.f.optMatchesDates.value && this.f.lineupStyle.value) {

      let dates = this.f.optMatchesDates.value.split(',').map(d => moment(d));
      minDate = moment.min(dates);

      let totalNumberOfPickDays = (this.f.gameSize.value * this.lineupStyles[this.f.lineupStyle.value] * this.f.draftSpeed.value.split('-')[1]) / 86400;

      let finalMinDate = minDate.subtract(totalNumberOfPickDays, 'days').format('YYYY-MM-DD');
      if (moment(finalMinDate).utc() <= moment().utc()) {
        this.formError.projectedDraftingEndDate = 'Projected Draft Date must be greater then current date. Please select Tournaments & Draft settings relevantly';
        this.resetDraftDate();
        return false;
      }

      delete this.formError.projectedDraftingEndDate;

      this.f.projectedDraftingEndDate.setValue(finalMinDate);

      // this.draftMinDate = new Date(moment().add(1, 'day').format('YYYY-MM-DD'));
      // this.draftMaxDate = new Date(finalMinDate.subtract(1, 'day').format('YYYY-MM-DD'));

      // this.showDraftDateField = true;

      //debugger

    }
  }

}
