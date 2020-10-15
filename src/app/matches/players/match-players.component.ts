import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatchesService } from '../../services/matches.service';

import { dateFormatString, range, formatDateTimeZone, getJsonValueOfKey } from '../../services/utils.service';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

declare const $: any;

@Component({
  selector: 'app-match-players',
  templateUrl: './match-players.component.html',
  styleUrls: ['./match-players.component.scss', '../../shared/scss/shared.scss']
})
export class MatchPlayerListComponent implements OnInit, AfterViewChecked {
  public INITIAL_PARAMS = {
    per_page: 20,
    current_page: 1,
    team_id: '',
    team_name: '',
    position: '',
    position_type: '',
    match_id: '',
    playerName: '',
    showPendingShotoutFP: false,
    showPendingLiveActionFP: false,
    match_unique_id: this.route.snapshot.paramMap.get('matchId'),
  };

  public params = localStorage.getItem('matchPlayerlistFilters')
    ? JSON.parse(localStorage.getItem('matchPlayerlistFilters'))
    : { ... this.INITIAL_PARAMS };
  public playersList = [];
  public totalplayers = 0;
  public totalPaginationShow = [];
  public totalPages = 0;
  public error = false;
  public allteams = [];
  public teams = [];
  public allTeams = [];
  public allPositions = [];
  public allPositionTypes = [];
  public formatDateTimeZone = formatDateTimeZone;
  public dateFormatString = dateFormatString;
  searchTextChanged: Subject<string> = new Subject<string>();
  public url: string = 'season/get_match_players?';

  constructor(
    private matchesService: MatchesService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {

    if (localStorage.getItem('matchPlayerlistFilters')) {
      localStorage.removeItem('matchPlayerlistFilters');
    }
    this.getAllPlayers();
    this.searchTextChanged.pipe(debounceTime(1000))
      .subscribe(model => this.getAllPlayers());
  }

  private createUrl() {
    this.url = 'season/get_match_players?';
    this.url += 'per_page=' + this.params.per_page + '&page=' + this.params.current_page + '&team_id=' + this.params.team_id + '&team_name=' + this.params.team_name +'&position=' + this.params.position + '&position_type=' + this.params.position_type + '&match_id=' + this.params.match_id + '&playerName=' + this.params.playerName + '&match_unique_id=' + this.route.snapshot.paramMap.get('matchId');
  }

  ngAfterViewChecked() {
    $('[data-toggle="tooltip"]').tooltip();
  }

  search() {
    this.searchTextChanged.next();
  }

  private getAllPlayers() {
    this.createUrl();
    this.matchesService.getMatchPlayers(this.url)
      .subscribe((response: any) => {
        if (response.data && response.data.data) {
          this.playersList = response.data.data;
          this.teams = this.teams.length ? this.teams : response.teams;
          this.allPositions = this.allPositions.length ? this.allPositions : response.positions;
          this.allPositionTypes = this.allPositionTypes.length ? this.allPositionTypes : response.position_type;
          this.createPaginationItem(response.data.total);
        }
        this.error = false;
      }, () => {
        this.error = true;
      });
  }


  saveFantasyPoint(player: any) {
    if (!(player['shutout_fantasy_point'] >= 0 && player['shutout_fantasy_point'] <= 99.9)) {
      this.toastr.error('The Fantasy Point field must contain a number 0 to 99.9');
      return false;
    }
    if (!(player['live_action_fantasy_point'] >= 0 && player['live_action_fantasy_point'] <= 99.9)) {
      this.toastr.error('The Fantasy Point field must contain a number 0 to 99.9');
      return false;
    }
    if (player.player_unique_id) {
      this.matchesService.setPlayerFantasyPoint(player)
        .subscribe((response: any) => {
          if (response) {
            this.toastr.success(response.message);
          }
        }, (error: any) => this.toastr.error(error.error['error'])
        );
    }
  }

  private createPaginationItem(totalplayers: number) {
    this.totalplayers = totalplayers;
    const maxPages: number = Math.ceil(totalplayers / this.params.per_page);
    const end = (this.params.current_page + 5) < maxPages ? this.params.current_page + 5 : maxPages;
    const start = (this.params.current_page - 5) > 1 ? this.params.current_page - 5 : 1;
    this.totalPages = maxPages;
    this.totalPaginationShow = range(end, start);
  }

  public paginateList(newPage: number) {
    if (this.params.current_page === newPage) { return false; }
    this.params.current_page = newPage;
    localStorage.setItem('matchPlayerlistFilters', JSON.stringify(this.params));
    this.getAllPlayers();
  }

  public nextOrPreviousPage(deviation: number) {
    this.params.current_page = this.params.current_page + deviation;
    localStorage.setItem('matchPlayerlistFilters', JSON.stringify(this.params));
    this.getAllPlayers();
  }

  positionTypeChange() {
    this.params.position = '';
  }

  public searchFilter(type?: string) {
    localStorage.setItem('matchPlayerlistFilters', JSON.stringify(this.params));
    if (type === 'reset') {
      this.params = { ... this.INITIAL_PARAMS };
      localStorage.removeItem('matchPlayerlistFilters');
    }
    this.params.current_page = 1;
    this.getAllPlayers();
  }

  public formatDate(date) {
    return date.replace(' ', 'T') + 'Z';
  }
  public getJsonValueOfKey(jsonString: string, getKey: any) {
    const value = JSON.parse(jsonString)[getKey];
    return (value) ? value : '';
  }
}
