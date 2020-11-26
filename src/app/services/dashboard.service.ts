import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(
    private http: HttpClient
  ) { }

  getAllStats(params: any) {
    return this.http.post(`${environment.API_URL}/dashboard/get_all_stats`, params);
  }

  getJackpotDetails(contest_type: any) {
    return this.http.post(`${environment.API_URL}/dashboard/get_jackpot`, { contest_type: contest_type });
  }

  updateJackpotBaseAmount(jackpotId: any, amount: any) {
    return this.http.post(`${environment.API_URL}/dashboard/update_jackpot_amount`, { jackpot_id: jackpotId, amount });
  }
}
