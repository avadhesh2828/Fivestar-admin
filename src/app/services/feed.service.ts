import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, throwError } from 'rxjs';

import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class FeedService {

  constructor(
    private http: HttpClient
  ) { }

  getLeagues(params: any) {
    return this.http.post(`${environment.API_URL}/feeds/get_all_league`, params);
  }

  getSports(params: any) {
    return this.http.post(`${environment.API_URL}/feeds/get_all_sports`, params);
  }

  changeSportsStatus(params: any) {
    return this.http.post(`${environment.API_URL}/feeds/update_sport_status`, params);
  }

  changeLeagueStatus(params: any) {
    return this.http.post(`${environment.API_URL}/feeds/update_league_status`, params);
  }

  getLeagueFilters() {
    return forkJoin([
      this.http.post(`${environment.API_URL}/feeds/get_all_league_countries`, {}),
      this.http.post(`${environment.API_URL}/feeds/get_all_sports`, { itemsPerPage: -1 }),
    ]);
  }

  getTeams(params: any) {
    return this.http.post(`${environment.API_URL}/feeds/get_all_teams`, params);
  }

  getTeamOrMatchFilters() {
    return this.http.post(`${environment.API_URL}/contest/pre_contest_data`, {});
  }

  getMatches(params: any) {
    return this.http.post(`${environment.API_URL}/feeds/get_all_matches`, params);
  }

  getTeamStats(params: any) {
    return this.http.post(`${environment.API_URL}/feeds/get_match_odds`, params);
  }

  getScoringList(params: any) {
    return this.http.post(`${environment.API_URL}/scoring/scoring_list`, params);
  }
  getMasterContestScoresList(params: any) {
    return this.http.post(`${environment.API_URL}/scoring/master_contest_scores_list`, params);
  }

  getPlayerXI(params: any) {
    return this.http.post(`${environment.API_URL}/team/player_xi`, params);
  }

  getMatchDetail(params: any) {
    return this.http.post(`${environment.API_URL}/team/match_details`, params);
  }

  getMatchNews(params: any) {
    return this.http.post(`${environment.API_URL}/season/get_match_news`, params);
  }

  addMatchNews(params: any) {
    return this.http.post(`${environment.API_URL}/season/add_match_news`, params);
  }

  editMatchNews(params: any) {
    return this.http.post(`${environment.API_URL}/season/update_match_news`, params);
  }

  deleteMatchNews(params: any) {
    return this.http.post(`${environment.API_URL}/season/delete_match_news`, params);
  }
  changePoints(params: any) {
    return this.http.post(`${environment.API_URL}/scoring/update_score_points`, params);
  }
}
