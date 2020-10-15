import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { forkJoin, throwError } from 'rxjs';

import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ContestService {
  constructor(private http: HttpClient, private authService: AuthService) { }

  getFilters() {
    return forkJoin([
      this.http.post(`${environment.API_URL}/contest/get_contest_filters`, {}),
      /*this.http.post(`${environment.API_URL}/contest/pre_contest_data`, {}),*/
    ]);
  }

  getContestStatus() {
    return this.http.post(`${environment.API_URL}/contest/get_contest_filters`, {});
  }

  getContests(url: string) {
    return this.http.get(`${environment.API_URL}/${url}`);
  }

  preContestData() {
    return this.http.get(`${environment.API_URL}/contest/pre-data`);
  }

  getTournaments(startDate, endDate, season_id) {
    return this.http.get(`${environment.API_URL}/contest/get-matches?start_date=${startDate}&end_date=${endDate}`);
  }

  getPrizes(type) {
    return this.http.get(`${environment.API_URL}/contest/get-prizes?type=${type}`);
  }

  getGameStyles(season_id) {
    return this.http.get(`${environment.API_URL}/contest/get-game-styles/${season_id}`);
  }

  getMatchWeeks(season_id, game_style_id) {
    return this.http.get(`${environment.API_URL}/contest/get-match-weeks/${season_id}/${game_style_id}`);
  }

  getDateRange(params: any) {
    return this.http.post(`${environment.API_URL}/contest/date_range_by_league`, params);
  }

  getMatchList(params: any) {
    return this.http.post(`${environment.API_URL}/contest/league_matches_by_date_range`, params);
  }

  createContest(params: object) {
    return this.http.post(`${environment.API_URL}/contest/create-contest`, params);
  }

  uploadContestImage(params: object) {
    return this.http.post(`${environment.API_URL}/contest/upload_contest_image`, params);
  }

  checkContestExists(params: object) {
    return this.http.post(`${environment.API_URL}/contest/check_contest_exist`, params);
  }

  getContestDetails(url) {
    return this.http.get(`${environment.API_URL}/${url}`);
  }

  getContestLeaderboard(urlLeaderboard) {
    return this.http.get(`${environment.API_URL}/${urlLeaderboard}`);
  }

  updateAutoRecurring(params: any) {
    return this.http.post(`${environment.API_URL}/contest/update_autorecurring`, params);
  }

  cancelContest(params: any) {
    return this.http.post(`${environment.API_URL}/contest/cancel_contest`, params);
  }

  getPredictions(params: any) {
    return this.http.post(`${environment.API_URL}/contest/get_user_predictions_detail`, params);
  }

  getAdHocPrizePool(params: any) {
    return this.http.post(`${environment.API_URL}/contest/prize_composition`, params);
  }
  getEventList(params: any) {
    return this.http.post(`${environment.API_URL}/common/event_list`, params);
  }

  getMaterGameStyle(params: any) {
    return this.http.post(`${environment.API_URL}/common/game_style_list`, {params});
  }

  updateContest(params: any) {
    return this.http.post(`${environment.API_URL}/contest/update-contest`, params);
  }

  deleteContest(params: any) {
    return this.http.post(`${environment.API_URL}/contest/delete-contest`, params);
  }

  completeContest(params: any) {
    return this.http.post(`${environment.API_URL}/contest/contest-complete`, params);
  }

  cancelledContest(params: any) {
    return this.http.post(`${environment.API_URL}/contest/contest-cancelled`, params);
  }

  completePrediction(params: any) {
    return this.http.post(`${environment.API_URL}/contest/update-prediction`, params);
  }

  fighterPics(params: any) {
    return this.http.post(`${environment.API_URL}/contest/contest-fighter-pic`, params);
  }

}
