import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import * as moment from 'moment';
import { ContestService } from '../../services/contest.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-contest',
  templateUrl: './create-contest.component.html',
  styleUrls: ['./create-contest.component.scss']
})
export class CreateContestComponent implements OnInit {

  public league: any = '';
  public gameStyle: any = '';
  public sizeType: any = '';
  public contestForm: FormGroup;
  public submitted: boolean;
  public formError: any = {};
  public formSubmitted: boolean;
  public masterGameStyle = [];
  public events = [];
  public error='';
  public minDate: Date;
  public endDate;
  cities = [
    {id: 1, name: 'Vilnius'},
    {id: 2, name: 'Kaunas'},
    {id: 3, name: 'Pavilnys', disabled: true},
    {id: 4, name: 'Pabradė'},
    {id: 5, name: 'Klaipėda'}
];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private contestService: ContestService,
  ) { }

  ngOnInit() {
    this.minDate = new Date();
    this.minDate.setDate(this.minDate.getDate() + 1);
    if (history.state.pre == undefined) {
      setTimeout(() => this.router.navigate(['/contest/create-new']), 500);
    } else if (history.state.pre != undefined) {
      this.league = history.state.pre.league;
      this.gameStyle = history.state.pre.gameStyle;
      this.sizeType = history.state.pre.sizeType;
    }
    this.initContestForm();
    this.getEventList();
    this.getMaterGameStyle();
  }
  getEventList(){
    this.contestService.getEventList({})
      .subscribe((response: any) => {
        this.events = response.data;
      }, (err: Error) => {
        this.toastr.error(err.message || 'There was an error.');
        //this.error = true;
      });
  }

  getMaterGameStyle(){
    this.contestService.getMaterGameStyle({})
      .subscribe((response: any) => {
        this.masterGameStyle = response.data;
      }, (err: Error) => {
        this.toastr.error(err.message || 'There was an error.');
        //this.error = true;
      });
  }


  initContestForm() {

    this.contestForm = this.formBuilder.group({
      contestName: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
      master_game_styles_id: ['', [Validators.required]],
      event_id: ['', [Validators.required]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]]
    //   league: [this.league.league_id, [Validators.required]],
    //   masterGameStyleId: [this.gameStyle.master_game_styles_id, Validators.required],
    //   sizeType: [this.sizeType.abbr, [Validators.required]],
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
      //let startDates = this.f.startDate.value.split(',').map(d => moment(d));
      //let endDates = this.f.endDate.value.split(',').map(d => moment(d));
      //let startDate = moment.min(startDates).format('YYYY-MM-DD HH:mm');
      //let endDate = moment.max(endDates).format('YYYY-MM-DD HH:mm');

      const formInputData = {
        // season_id: this.league.season.season_id,
        master_game_style_id: this.f.master_game_styles_id.value,
        event_id: this.f.event_id.value,
        contest_name: this.f.contestName.value,
        entry_fees: this.f.entryFees.value,
        start_date: this.formatDate(this.f.startDate.value),
        end_date: this.formatDate(this.f.endDate.value),
        //opt_matches: this.f.optMatches.value,
        //opt_matches_dates: this.f.optMatchesDates.value,
        // play_off_date: moment(this.f.play_off_date.value).format('YYYY-MM-DD'),
        game_size: this.f.gameSize.value,
        site_rake: this.f.siteRake.value,
        prize_pool: this.f.prizePool.value,
        prize_payout: this.f.prizePayout.value,
        // lineup_style: this.f.lineupStyle.value,
        // draft_type: this.f.draftType.value,
        // projected_drafting_end_date: this.f.projectedDraftingEndDate.value,
        // draft_speed: this.f.draftSpeed.value,
        // when_to_draft: this.f.whenToDraft.value,

      };

      this.formSubmitted = true;
      this.contestService.createContest({ contest_details: formInputData }).pipe()
        .subscribe((res: any) => {
          this.formSubmitted = false;
          if (res.response_code == 200) {
            this.toastr.success(res.message || 'New Contest Created Sucessfully.');
            this.formError = '';
            this.router.navigate(['/contest/list']);
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
  formatDate(date) {
    return moment(date).format('YYYY-MM-DD');
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
      }

    }
  }


  handleReset() {
    this.contestForm.reset();
    this.submitted = false;
    this.formSubmitted = false;
    this.initContestForm();
  }

}
