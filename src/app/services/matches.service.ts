import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class MatchesService {

  constructor(
    private http: HttpClient
  ) { }

  getAllLeagues() {
    return this.http.post(`${environment.API_URL}/season/get_all_league`, {});
  }

  getAllTeams(params: any) {
    return this.http.post(`${environment.API_URL}/season/get_all_team`, params);
  }

  getAllWeeks(params: any) {
    return this.http.post(`${environment.API_URL}/season/get_all_week`, params);
  }

  getAllMatches(url: any) {
    return this.http.get(`${environment.API_URL}/${url}`);
  }

  getMatchPlayers(url: any) {
    return this.http.get(`${environment.API_URL}/${url}`);
  }

  getAllFighters(params: any) {
    return this.http.get(`${environment.API_URL}/player/players-list`);
  }

  createMatch(params: any) {
    return this.http.post(`${environment.API_URL}/match/create_match`, params);
  }

  getMatchDetail(params: any) {
    return this.http.post(`${environment.API_URL}/match/match_details`, params);
  }

  setPlayerFantasyPoint(params: any) {
    return this.http.post(`${environment.API_URL}/season/set_player_fantasy_point`, params);
  }

  getAllSeasons(params: any) {
    return this.http.get(`${environment.API_URL}/season/get_all_seasons`);
  }

  getCombatTypes(params: any) {
    return this.http.get(`${environment.API_URL}/common/combat_types`);
  }

  getEditMatchDetail(params: any) {
    return this.http.post(`${environment.API_URL}/match/edit-match-details`, params);
  }

  updateMatch(params: any) {
    return this.http.post(`${environment.API_URL}/match/update-match`, params);
  }
  deleteMatch(params: any) {
    return this.http.post(`${environment.API_URL}/match/delete-match`, params);
  }
  getAllWeightClasses(params: any) {
    return this.http.post(`${environment.API_URL}/match/get-weight-classes`, params);
  }
  getAllNewsList(params: any) {
    return this.http.post(`${environment.API_URL}/match/get-news-list`, params);
  }
  getAllVictoryType(params: any) {
    return this.http.post(`${environment.API_URL}/common/victory-type`, params);
  }
  addFightResult(params: any) {
    return this.http.post(`${environment.API_URL}/match/add-fight-result`, params);
  }
}
