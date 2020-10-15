import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import * as moment from 'moment';
import { ContestService } from '../../services/contest.service';
import { ToastrService } from 'ngx-toastr';
import { LoaderService } from '../../shared/loader/loader.service';

@Component({
  selector: 'app-edit-contest',
  templateUrl: './edit-contest.component.html',
})
export class EditContestComponent implements OnInit {

  public league: any = '';
  public gameStyle: any = '';
  public sizeType: any = '';
  public contestForm: FormGroup;
  public submitted: boolean;
  public formError: any = {};
  public formSubmitted: boolean;
  public masterGameStyle = [];
  public events = [];
  public error = '';
  public minDate: Date;
  public endDate: Date;
  public startDate: Date;

  public prizes = [];
  public prizePool: number = 0;
  public prizeComposition = [];

  public participants = [];
  public winners = [];
  public contest_unique_id = "";
  public contest;
  public url = '';
  public contest_uid;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private contestService: ContestService,
    private loaderService: LoaderService,
  ) { }

  ngOnInit() {
    this.minDate = new Date();
    this.minDate.setDate(this.minDate.getDate() + 1);
    const id = this.route.snapshot.paramMap.get('contestId');
    
    this.initContestForm();
    this.getContestDetail();
    this.getEventList();
    this.getMaterGameStyle();
    this.getPrizes();
    this.calculatePrizePool();
  }
  getPrizes(){
    this.contestService.getPrizes('multiplayer').subscribe((res: any) => {
      this.prizes = res.data;
    }, (err: any) => {
      this.prizes = [];
      this.toastr.error(err.error.global_error || 'There was an error.');
    });
  }
  private getContestDetail() {
    this.loaderService.display(true);
    this.createUrl();
    this.contestService.getContestDetails(this.url)
      .subscribe((contest: any) => {
        this.contest = contest.data.contest;
        this.startDate = new Date(this.contest.start_date);
        this.endDate = new Date(this.contest.end_date);
        this.loaderService.display(false);
      }, (err: object) => {
        this.contest = {};
      });
  }
  createUrl() {
    this.contest_unique_id = this.route.snapshot.paramMap.get('contestId');
    this.url = "contest/detail/" + this.contest_unique_id + "?";
    //this.url += 'perPage=' + this.params.per_page + '&page=' + this.params.current_page;
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

  getMaterGameStyle() {
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
      endDate: ['', [Validators.required]],
      prizePayout: ['', [Validators.required]],
      prizePool: ['', Validators.required],
      gameSize: [20, [Validators.required, Validators.min(5), Validators.max(100)]],
      siteRake: [9, [Validators.required]],
      entryFees: [10, [Validators.required, Validators.min(0), Validators.max(10000)]],
    });
  }

  onSubmit() {

    this.submitted = true;

    if (this.contestForm.invalid || Object.keys(this.formError).length > 0) {
      return;
    }
    else {

      const formInputData = {
        // season_id: this.league.season.season_id,
        master_game_style_id: this.f.master_game_styles_id.value,
        event_id: this.f.event_id.value,
        contest_name: this.f.contestName.value,
        entry_fees: this.f.entryFees.value,
        start_date: this.formatDate(this.startDate),
        end_date: this.formatDate(this.endDate),
        game_size: this.f.gameSize.value,
        site_rake: this.f.siteRake.value,
        prize_pool: this.f.prizePool.value,
        prize_payout: this.f.prizePayout.value,
        contest_uid: this.contest.contest_uid,

      };

      this.formSubmitted = true;
      this.contestService.updateContest({ contest_details: formInputData }).pipe()
        .subscribe((res: any) => {
          this.formSubmitted = false;
          if (res.response_code == 200) {
            this.toastr.success(res.message || 'Contest Update Successfully.');
            this.formError = '';
            this.router.navigate(['/contest/list']);
          }
        }, err => {
          let errorMessage = '';
          this.toastr.error(errorMessage || err.error.global_error || 'Some error occurred while updating contest.');
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
        //this.f.endDate.value = this.formatDate(date);
      }

    }
  }

  calculatePrizePool() {

    let siteRake = (this.f.entryFees.value * this.f.gameSize.value) * (this.f.siteRake.value / 100);
    let prizePool = (this.f.entryFees.value * this.f.gameSize.value) - siteRake;
    this.prizePool = (prizePool <= 0) ? 0 : prizePool;

    this.f.prizePool.setValue(this.prizePool);

    this.calculatePrizeDistributionAmount();
  }

  calculatePrizeDistributionAmount() {
    let composition = [];
    let msg = '';
    let type = 'error';
    this.prizeComposition = []
    this.prizes.map((prize: any) => {
      //alert(this.f.prizePayout.value);
      //alert(prize.master_prize_id);
      if (prize.master_prize_id == this.f.prizePayout.value) {
        composition = JSON.parse(prize.composition)
      }
    });

    if (composition.length > 0) {

      composition.map((val, index) => {
        this.computeAmountOnRank(val)
      });
    }
  }

  computeAmountOnRank(separation) {

    if (isNaN(separation.max_place)) {
      let diviser = separation.max_place.split('/')[1]
      switch (parseInt(diviser)) {
        case 2:
          this.prizeComposition.push(`Top 50 % will get $${this.prizePool}`)
          break;
        case 3:
          this.prizeComposition.push(`Top 30 % will get $${this.prizePool}`)
          break;
      }

    } else {
      let rankMsg = 'Top '
      rankMsg += (separation.max_place == separation.min_place) ? separation.max_place : separation.min_place + ' - ' + separation.max_place;
      let amount: any;
      amount = this.prizePool * (separation.value / 100);
      amount = amount.toFixed(2);
      this.prizeComposition.push(`${rankMsg} will get $${amount}`);
    }
  }

}
