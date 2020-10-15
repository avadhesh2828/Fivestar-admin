import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) { }

  getUsers(params: object) {
    return this.http.post(`${environment.API_URL}/users`, params);
  }

  getUserDetails(userId: string) {
    return this.http.post(`${environment.API_URL}/user/get_user_detail`, { user_unique_id: userId });
  }

   getAgentTicketDetails(params: object) {
    return this.http.post(`${environment.API_URL}/user/get_agent_ticket_detail`,params);
  }

  changeUserStatus(params: object) {
    return this.http.post(`${environment.API_URL}/user/change_user_status`, params);
  }

  getCountryList() {
    return this.http.post(`${environment.API_URL}/common/country_list`, {});
  }

  getStateList(params: any){
      return this.http.post(`${environment.API_URL}/common/state_list`, params);
  }

  editUsername(params: any) {
    return this.http.post(`${environment.API_URL}/user/change_user_name`, params);
  }

  getPortfolioDetail(params: object)
  {
    return this.http.post(`${environment.API_URL}/user/portfolio`, params);
  }

  getUserWatchList(params:object)
  {
    return this.http.post(`${environment.API_URL}/user/watchlist`, params);
  }
}
