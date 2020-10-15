import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { FeedService } from '../../services/feed.service';

@Component({
  selector: 'app-matches-stats',
  templateUrl: './matches-stats.component.html',
  styleUrls: ['./matches-stats.component.scss', '../../shared/scss/shared.scss']
})
export class MatchesStatsComponent implements OnInit {
  public matchData = null;
  public error = false;
  public odds: any = { home: [], common: [], away: [] };
  public cricketResultIndex: any = {};

  constructor(private feedService: FeedService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.getTeamStats();
  }

  private getTeamStats() {
    const season_id = this.route.snapshot.paramMap.get('matchId');
    this.feedService.getTeamStats({ season_id }).pipe(first())
      .subscribe((response: any) => {
        if (response.data) {
          this.matchData = response.data;
          this.matchData.odds.forEach(odd => {
            if (odd.team_id === this.matchData.home) {
              this.odds.home.push(odd);
            } else if (odd.team_id === this.matchData.away) {
              this.odds.away.push(odd);
            } else {
              this.odds.common.push(odd);
            }
          });
          if (this.matchData.match_result && this.matchData.sport_id === '2') {
            this.cricketResultIndex.home = Object.keys(this.matchData.match_result).find(key =>
              this.matchData.match_result[key].team === 'localteam'
            );
            this.cricketResultIndex.away = Object.keys(this.matchData.match_result).find(key =>
              this.matchData.match_result[key].team === 'visitorteam'
            );
          }
        }
        this.error = false;
      }, () => {
        this.error = true;
      });
  }

  public tableOrder() {
    return 1;
  }

  public formatDate(date) {
    return date.replace(' ', 'T') + 'Z';
  }
}
