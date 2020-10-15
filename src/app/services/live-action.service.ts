import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { forkJoin, throwError } from 'rxjs';

import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LiveActionService {
  constructor(private http: HttpClient, private authService: AuthService) { }

  getFilters() {
    return forkJoin([
      this.http.post(`${environment.API_URL}/live_action/get_live_action_filters`, {}),
      this.http.post(`${environment.API_URL}/live_action/pre_live_action_data`, {}),
    ]);
  }

  getContestStatus() {
    return this.http.post(`${environment.API_URL}/live_action/get_live_action_filters`, {});
  }

  getContests(params: object) {
    return this.http.post(`${environment.API_URL}/live_action/live_action_list`, params);
  }

  getContestSettings() {
    return this.http.post(`${environment.API_URL}/live_action/pre_live_action_data`, {});
  }

  getDateRange(params: any) {
    return this.http.post(`${environment.API_URL}/live_action/date_range_by_league`, params);
  }

  getWeeks(params: any) {
    return this.http.post(`${environment.API_URL}/live_action/upcoming_weeks`, params);
  }

  getMatchList(params: any) {
    return this.http.post(`${environment.API_URL}/live_action/matches_by_date_range`, params);
  }

  createContest(params: object) {
    return this.http.post(`${environment.API_URL}/live_action/new_live_action`, params);
  }

  checkContestExists(params: object) {
    return this.http.post(`${environment.API_URL}/live_action/check_live_action_exist`, params);
  }

  getContestDetails(contestId: string) {
    return this.http.post(`${environment.API_URL}/live_action/get_live_action_detail`, { contest_uid: contestId });
  }

  updateAutoRecurring(params: any) {
    return this.http.post(`${environment.API_URL}/live_action/update_autorecurring`, params);
  }

  getPredictions(params: any) {
    return this.http.post(`${environment.API_URL}/live_action/get_user_predictions_detail`, params);
  }

  getAdHocPrizePool(params: any) {
    return this.http.post(`${environment.API_URL}/live_action/prize_composition`, params);
  }

}
