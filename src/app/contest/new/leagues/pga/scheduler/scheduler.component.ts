import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { range, dateFormatString, formatDateTimeZone } from '../../../../../services/utils.service';
import { ContestService } from '../../../../../services/contest.service';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

@Component({
  selector: 'app-new-contest-scheduler',
  templateUrl: './scheduler.component.html',
  styleUrls: ['./scheduler.component.scss']
})
export class SchedulerComponent implements OnInit {

  @Input() parentFormGroup: FormGroup;
  @Input() season_id;
  @Input() submitted: boolean;
  @Input() formError: any;

  public minDate: Date;
  public startDate;
  public endDate;
  public playOffMinDate: any;
  public playOffMaxDate: any;
  public tournaments = [];
  public optMatches = [];
  public optMatchesDates = [];
  public dateFormatString = dateFormatString;

  constructor(
    private toastr: ToastrService,
    private contestService: ContestService,
  ) { }

  ngOnInit() {

    this.minDate = new Date();
    this.minDate.setDate(this.minDate.getDate() + 1);

    this.parentFormGroup.addControl('startDate', new FormControl('', Validators.required));
    this.parentFormGroup.addControl('endDate', new FormControl('', Validators.required));
    // this.parentFormGroup.addControl('playOffDate', new FormControl('', Validators.required));
    this.parentFormGroup.addControl('optMatches', new FormControl('', Validators.required));
    this.parentFormGroup.addControl('optMatchesDates', new FormControl('', Validators.required));

  }

  get f() {
    return this.parentFormGroup.controls;
  }

  validateStartEndDate(from, date) {
    if (from == 'end' && !this.f.startDate.value) {
      return;
    }
    // this.f.playOffDate.setValue('');
    delete this.formError.endDate;
    if (from == 'start') {
      this.f.endDate.setValue('');
    } else if (from == 'end') {
      if (date != null && moment(date).isBefore(this.f.startDate.value)) {
        this.formError.endDate = 'End Date must be laster then Start Date';
      } else {
        this.endDate = this.formatDate(date);
        this.getTournaments();
      }

    }
  }

  validatePlayOffDate(date) {
    if (date != null) {
      let minDate: any;
      let maxDate: any;
      let dates = this.f.optMatchesDates.value.split(',').map(d => moment(d));
      minDate = moment.min(dates);
      maxDate = moment.max(dates);
      console.log(moment(date).isBetween(minDate, maxDate));

      if (!moment(date).isBetween(minDate, maxDate)) {
        this.formError.playOffDate = 'Playoff Date must be between Start Date & End Date';
      } else if (moment(date) == minDate) {
        this.formError.playOffDate = 'Playoff Date must be greater than first selected tournament date';
      } else if (moment(date) == maxDate) {
        this.formError.playOffDate = 'Playoff Date must be smaller than last selected tournament date';
      }
      else {
        delete this.formError.playOffDate;
      }
    }
  }

  getTournaments() {
    this.startDate = this.formatDate(this.f.startDate.value);

    this.contestService.getTournaments(this.startDate, this.endDate, this.season_id).subscribe((res: any) => {
      this.tournaments = res.data;
    }, (err: any) => {
      this.tournaments = [];
      this.toastr.error(err.error.global_error || 'There was an error.');
    });
  }

  formatDate(date) {
    return moment(date).format('YYYY-MM-DD');
  }

  optAllMatches = function () {
    // this.f.whenToDraft.setValue('');
    // this.f.projectedDraftingEndDate.setValue('');
    // this.f.playOffDate.setValue('');

    if (this.tournaments.length == this.optMatches.length) {
      this.optMatches = [];
    } else {
      let allMatchId = [];
      let allMatchDates = [];
      this.tournaments.map((value, key) => {
        allMatchId.push(value.match_id);
        allMatchDates.push(value.scheduled_date_time);
      });
      this.optMatches = allMatchId;
      this.optMatchesDates = allMatchDates;
    }
    this.f.optMatches.setValue(this.optMatches.join(','));
    this.f.optMatchesDates.setValue(this.optMatchesDates.join(','));
  }

  toggleOptMatch = function (match_id, match_start_date) {
    // this.f.whenToDraft.setValue('');
    // this.f.projectedDraftingEndDate.setValue('');
    // this.f.playOffDate.setValue('');

    if (this.optMatches.indexOf(match_id) < 0) {
      this.optMatches.push(match_id);
      this.optMatchesDates.push(match_start_date);

    } else {
      var index = this.optMatches.indexOf(match_id);
      this.optMatches.splice(index, 1);

      var dateIndex = this.optMatchesDates.indexOf(match_start_date);
      this.optMatchesDates.splice(dateIndex, 1);
    }
    this.f.optMatches.setValue(this.optMatches.join(','));
    this.f.optMatchesDates.setValue(this.optMatchesDates.join(','));
  }

}
