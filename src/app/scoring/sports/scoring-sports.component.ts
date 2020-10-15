import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FeedService } from '../../services/feed.service';
import { CONTEST_STATUS } from '../constants';

@Component({
  selector: 'app-scoring-sports',
  templateUrl: './scoring-sports.component.html',
  styleUrls: ['./scoring-sports.component.scss', '../../shared/scss/shared.scss']
})

export class ScoringSportsComponent implements OnInit {
  public params: any = { matchType: 'T20', scoreType: 'win' };
  public error = false;
  public contestStatus = CONTEST_STATUS;
  public currentSport = null;
  public sports = [];
  sportId: string;
  public countries = [];
  public leagues = [];
  allContests = [];
  displayData = [];
  matchType = [];
  scoreType = [];
  pointsDisabled = true;

  constructor(private feedService: FeedService, private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.sportId = params['sport_id'];
      this.getScoringData(); // reset and set based on new parameter this time
    });
  }

  getScoringData() {
    this.feedService.getScoringList({ sport_id: this.sportId })
      .subscribe((response: any) => {
        if (response.data) {
          if (this.sportId === '1') {
            this.displayData = response.data.contest;
          } else {
            this.allContests = response.data.contest;
            this.matchType = Object.keys(this.allContests);
            if (this.params.matchType) {
              this.scoreType = Object.keys(this.allContests[this.params.matchType]);
            }
            this.initializeCricketData();
          }
        }
        this.error = false;
      }, () => {
        this.error = true;
      });
  }

  initializeCricketData() {
    this.displayData = [];
    if (!this.params.matchType) {
      Object.keys(this.allContests).forEach(matchType => {
        Object.keys(this.allContests[matchType]).forEach(market => {
          this.displayData.push(...this.allContests[matchType][market]);
        });
      });
    } else {
      if (!this.params.scoreType) {
        Object.keys(this.allContests[this.params.matchType]).forEach(market => {
          this.displayData.push(...this.allContests[this.params.matchType][market]);
        });
      } else {
        this.displayData = this.allContests[this.params.matchType][this.params.scoreType];
      }
    }
  }

  onMatchTypeChange() {
    this.params.scoreType = '';
    this.scoreType = Object.keys(this.allContests[this.params.matchType]);
  }

  searchFilter(type?: string) {
    if (type === 'reset') {
      this.params = { matchType: 'T20', scoreType: 'win' };
      this.matchType = Object.keys(this.allContests);
      this.scoreType = Object.keys(this.allContests[this.params.matchType]);
    }
    this.initializeCricketData();
  }

  public onSubmit(data) {
    this.feedService.changePoints({ master_contest_scoring_id: data.master_contest_scoring_id, points: data.current_points})
    .subscribe((response: any) => {
      if(response.status){
        data.isEditable = false;
        data.points = data.current_points;
      }
    });
  }
}
