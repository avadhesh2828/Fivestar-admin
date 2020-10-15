import { Component, OnInit } from '@angular/core';

import { TeamService } from '../../services/team.service';
import { range } from '../../services/utils.service';
import { TEAM_STATUS } from '../constants';

const INITIAL_PARAMS = {
  per_page: 20,
  current_page: 1,
  league_id: 1,
  sort_field: 'team_id',
  sort_order: 'ASC'
};

@Component({
  selector: 'app-teams-list',
  templateUrl: './teams-list.component.html',
  styleUrls: ['./teams-list.component.scss', '../../shared/scss/shared.scss']
})
export class TeamListComponent implements OnInit {
  public params: any = { ...INITIAL_PARAMS };
  public teamsList = null;
  public totalTeams = 0;
  public totalPaginationShow = [];
  public totalPages = 0;
  public error = false;
  public teamStatus = TEAM_STATUS;
  public currentSport = null;
  public allLeagues = [];
  public sort_field = 'team_id ASC';
  public url: string = 'team/get_all_teams?';

  constructor(
    private teamService: TeamService,
  ) { }

  ngOnInit() {
    this.getTeamFilters();
  }

  private createUrl() {
    this.url = 'team/get_all_teams?';
    this.url += 'per_page=' + this.params.per_page + '&page=' + this.params.current_page + '&league_id=' + this.params.league_id;
  }

  private getTeamFilters() {
    this.teamService.pre_team_data()
      .subscribe((response: any) => {
        if (response.data) {
          this.allLeagues = response.data.leagues;
          this.params.league_id = this.allLeagues[0]['league_id'];
        }
        this.getTeams();
        this.error = false;
      }, () => {
        this.error = true;
      });
  }

  private getTeams() {
    this.createUrl();
    this.teamService.getTeams(this.url)
      .subscribe((response: any) => {
        if (response.data && response.data.data) {
          this.teamsList = response.data.data;
          this.createPaginationItem(response.data.total);
        }
        this.error = false;
      }, () => {
        this.error = true;
      });
  }

  private createPaginationItem(totalTeams: number) {
    this.totalTeams = totalTeams;
    const maxPages: number = Math.ceil(totalTeams / this.params.per_page);
    const end = (this.params.current_page + 5) < maxPages ? this.params.current_page + 5 : maxPages;
    const start = (this.params.current_page - 5) > 1 ? this.params.current_page - 5 : 1;
    this.totalPages = maxPages;
    this.totalPaginationShow = range(end, start);
  }

  public paginateList(newPage: number) {
    if (this.params.current_page === newPage) { return false; }
    this.params.current_page = newPage;
    this.getTeams();
  }

  public nextOrPreviousPage(deviation: number) {
    this.params.current_page = this.params.current_page + deviation;
    this.getTeams();
  }

  public searchFilter(type?: string) {
    if (type === 'reset') {
      this.params = { ...INITIAL_PARAMS };
    }
    this.params.current_page = 1;
    this.getTeams();
  }
}
