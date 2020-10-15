import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContestService } from '../../services/contest.service';
import { RoundOffDecimalPipe } from '../../pipes/round-off-decimal';
import { Constants } from '../../constants';
import { range, dateFormatString, formatDate, formatDateTimeZone } from '../../services/utils.service';
import { environment } from '../../../environments/environment';
import { keyframes } from '@angular/animations';

const INITIAL_PARAMS = {
  per_page: 10,
  current_page: 1,
};

@Component({
  selector: 'app-contest-detail',
  templateUrl: './contest-detail.component.html',
  styleUrls: ['./contest-detail.component.scss']
})
export class ContestDetailComponent implements OnInit {

  public formatDateTimeZone = formatDateTimeZone;
  public params = { ...INITIAL_PARAMS };
  public contest_unique_id = "";
  public contest;
  public url = '';
  public contest_id;
  public urlLeaderboard = '';
  public contestStatus = { 1: 'Upcoming', 2: 'Live', 3: 'Drafting', 4: 'Partial', 5: 'Cancelled', 6: 'Completed' };
  public contestType = { zen: 'Zenball', best: 'Bestball' };
  public prize;
  public prizeComposition = [];
  public prizes: object[] = [];
  public participants = [];
  public winners = [];
  public totalTransactions = 0;
  public totalPages = 0;
  public fighterPicsUser = [];
  public totalPaginationShow;
  public userss;

  constructor(
    private contestService: ContestService,
    private route: ActivatedRoute,
    private roundOffDecimal: RoundOffDecimalPipe
  ) { }

  ngOnInit() {
    this.getContestDetail();
  }


  private getContestDetail() {
    this.createUrl();
    this.contestService.getContestDetails(this.url)
      .subscribe((contest: any) => {
        this.contest = contest.data.contest;
        this.contest_id = this.contest.contest_id;
        this.prize = contest.data.prizes;
        this.winners = contest.data.winners;
        this.getContestLeaderboard();
        this.fighterPics();
        this.calculatePrizeDistributionAmount();
      }, (err: object) => {
        this.contest = {};
      });
  }

  private getContestLeaderboard() {
    this.urlLeaderboard = "contest/leaderboard/" + this.contest_id + "?";
    this.urlLeaderboard += 'perPage=' + this.params.per_page + '&page=' + this.params.current_page;
    this.contestService.getContestLeaderboard(this.urlLeaderboard)
      .subscribe((res: any) => {
        if(res.data.participants){
          this.participants = res.data.participants;
          console.log(this. participants);
          this.createPaginationItem(res.data.contest.total);
        }
      }, (err: object) => {
        this.participants = [];
      });
  }

  private fighterPics() {
    const data = {
      'contest_id':this.contest_id,
    }
    this.contestService.fighterPics(data)
      .subscribe((res: any) => {
        if(res.data){
          this.fighterPicsUser = res.data;
        }
      }, (err: object) => {
        this.participants = [];
      });
  }

  createUrl() {
    this.contest_unique_id = this.route.snapshot.paramMap.get('contestId');
    this.url = "contest/detail/" + this.contest_unique_id + "?";
    this.url += 'perPage=' + this.params.per_page + '&page=' + this.params.current_page;
    //leaderboard
    this.urlLeaderboard = "contest/leaderboard/" + this.contest_id + "?";
    this.urlLeaderboard += 'perPage=' + this.params.per_page + '&page=' + this.params.current_page;
  }

  calculatePrizeDistributionAmount() {
    let composition = [];
    let msg = '';
    let type = 'error';
    this.prizeComposition = []
    composition = JSON.parse(this.prize.composition)

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
          this.prizeComposition.push({ key: 'Top 50% will get', value: '$' + this.contest.prize_pool })
          break;
        case 3:
          this.prizeComposition.push({ key: 'Top 30% will get', value: '$' + this.contest.prize_pool })
          break;
      }

    } else {
      let rankMsg = 'Top '
      rankMsg += (separation.max_place == separation.min_place) ? separation.max_place : separation.min_place + ' - ' + separation.max_place;
      let amount: any;
      amount = this.contest.prize_pool * (separation.value / 100);
      amount = amount.toFixed(2);
      this.prizeComposition.push({ key: rankMsg, value: '$' + amount });
    }
  }

  public formatDate(date) {
    return date.replace(' ', 'T') + 'Z';
  }

  private createPaginationItem(totalTransactions: number) {
    this.totalTransactions = totalTransactions;
    const maxPages: number = Math.ceil(totalTransactions / this.params.per_page);
    const end = (this.params.current_page + 5) < maxPages ? this.params.current_page + 5 : maxPages;
    const start = (this.params.current_page - 5) > 1 ? this.params.current_page - 5 : 1;
    this.totalPages = maxPages;
    this.totalPaginationShow = range(end, start);
  }

  public paginateList(newPage: number) {
    if (this.params.current_page === newPage) { return false; }
    this.params.current_page = newPage;
    this.getContestDetail();
  }

  public nextOrPreviousPage(deviation: number) {
    this.params.current_page = this.params.current_page + deviation;
    this.getContestDetail();
  }
}
