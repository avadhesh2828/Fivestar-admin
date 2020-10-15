import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { forkJoin, throwError } from 'rxjs';

import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ShutoutService {
  constructor(private http: HttpClient, private authService: AuthService) { }

  getFilters() {
    return forkJoin([
      this.http.post(`${environment.API_URL}/shutout/get_shutout_filters`, {}),
      this.http.post(`${environment.API_URL}/shutout/pre_shutout_data`, {}),
    ]);
  }

  getContestStatus() {
    return this.http.post(`${environment.API_URL}/shutout/get_shutout_filters`, {});
  }

  getContests(params: object) {
    return this.http.post(`${environment.API_URL}/shutout/shutout_list`, params);
  }

  getContestSettings() {
    return this.http.post(`${environment.API_URL}/shutout/pre_shutout_data`, {});
  }

  getDateRange(params: any) {
    return this.http.post(`${environment.API_URL}/shutout/date_range_by_league`, params);
  }

  getWeeks(params: any) {
    return this.http.post(`${environment.API_URL}/shutout/upcoming_weeks`, params);
  }

  getMatchList(params: any) {
    return this.http.post(`${environment.API_URL}/shutout/matches_by_date_range`, params);
  }

  createContest(params: object) {
    return this.http.post(`${environment.API_URL}/shutout/new_shutout`, params);
  }

  checkContestExists(params: object) {
    return this.http.post(`${environment.API_URL}/shutout/check_shutout_exist`, params);
  }

  getContestDetails(params: any) {
    return this.http.post(`${environment.API_URL}/shutout/get_shutout_detail`, params);
  }

  updateAutoRecurring(params: any) {
    return this.http.post(`${environment.API_URL}/shutout/update_autorecurring`, params);
  }

  getPredictions(params: any) {
    return this.http.post(`${environment.API_URL}/shutout/get_user_predictions_detail`, params);
  }

  getAdHocPrizePool(params: any) {
    return this.http.post(`${environment.API_URL}/shutout/prize_composition`, params);
  }
  getParticipants(params: any) {
    return this.http.post(`${environment.API_URL}/shutout/get_participants_list`, params);
  }
  getContestPlayer(params: any) {
    return this.http.post(`${environment.API_URL}/shutout/get_contest_player_list`, params);
  }
  saveFantasyPoint(params: any) {
    return this.http.post(`${environment.API_URL}/shutout/set_player_fantasy_point`, params);
  }
  getPlayerFilters(params: any) {
    return this.http.post(`${environment.API_URL}/shutout/get_player_filters`, params);
  }
  getUserPlayerData(params: any) {
    return this.http.post(`${environment.API_URL}/shutout/user_players_data`, params);
  }
}
