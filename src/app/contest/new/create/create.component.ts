import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import * as moment from 'moment';
import { ContestService } from '../../../services/contest.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {

  public league: any = '';
  public gameStyle: any = '';
  public sizeType: any = '';
  public contestForm: FormGroup;
  public submitted: boolean;
  public formError: any = {};
  public formSubmitted: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private contestService: ContestService,
  ) { }

  ngOnInit() {
    if (history.state.pre == undefined) {
      setTimeout(() => this.router.navigate(['/contest/layout']), 500);
    } else if (history.state.pre != undefined) {
      this.league = history.state.pre.league;
      this.gameStyle = history.state.pre.gameStyle;
      this.sizeType = history.state.pre.sizeType;
    }
    this.initContestForm();
  }

  initContestForm() {

    this.contestForm = this.formBuilder.group({
      contestName: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
      league: [this.league.league_id, [Validators.required]],
      masterGameStyleId: [this.gameStyle.master_game_styles_id, Validators.required],
      sizeType: [this.sizeType.abbr, [Validators.required]],
    });
  }

  onSubmit() {

    this.submitted = true;

    if (this.contestForm.invalid || Object.keys(this.formError).length > 0) {
      return;
    }
    else {

      let dates = this.f.optMatchesDates.value.split(',').map(d => moment(d));
      let startDate = moment.min(dates).format('YYYY-MM-DD HH:mm');
      let endDate = moment.max(dates).format('YYYY-MM-DD HH:mm');

      const forminputdata = {
        season_id: this.league.season.season_id,
        master_game_styles_id: this.gameStyle.master_game_styles_id,
        contest_name: this.f.contestName.value,
        entry_fees: this.f.entryFees.value,
        start_date: startDate,
        end_date: endDate,
        opt_matches: this.f.optMatches.value,
        opt_matches_dates: this.f.optMatchesDates.value,
        play_off_date: moment(this.f.play_off_date.value).format('YYYY-MM-DD'),
        game_size: this.f.gameSize.value,
        site_rake: this.f.siteRake.value,
        prize_pool: this.f.prizePool.value,
        prize_payout: this.f.prizePayout.value,
        lineup_style: this.f.lineupStyle.value,
        draft_type: this.f.draftType.value,
        projected_drafting_end_date: this.f.projectedDraftingEndDate.value,
        draft_speed: this.f.draftSpeed.value,
        when_to_draft: this.f.whenToDraft.value,
      };

      this.formSubmitted = true;
      this.contestService.createContest({ contest_details: forminputdata }).pipe()
        .subscribe((res: any) => {
          this.formSubmitted = false;
          if (res.response_code == 200) {
            this.toastr.success(res.message || 'New Contest Created Sucessfully.');
            this.formError = '';
            this.router.navigate(['/contest/list']);
          }
        }, err => {
          debugger
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
