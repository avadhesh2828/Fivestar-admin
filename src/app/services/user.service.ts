import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private userObject = new BehaviorSubject({});
  currentUser = this.userObject.asObservable();
  constructor(private http: HttpClient) { }

  updateUser(user: any) {
    this.userObject.next(user);
  }

  // finding size of object
  sizeOfObject(obj: object) {
    let size = 0;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        size++;
      }
    }
    return size;
  }

  getUsers(params: object) {
    return this.http.get(`${environment.API_URL}/users/list`, params);
  }
  getAgents(url: any) {
    return this.http.get(`${environment.API_URL}/${url}`);
  }

  changeUserStatus(userId: any, data: object) {
    return this.http.post(`${environment.API_URL}/users/change-user-status/${userId}`, data);
  }

  searchPlayerLoginIP(data: object) {
    return this.http.post(`${environment.API_URL}/users/get-login-history`, data);
  }

  searchUser(data: object) {
    return this.http.post(`${environment.API_URL}/users/search-user`, data);
  }

  getUserDetails(userId: any) {
    return this.http.get(`${environment.API_URL}/users/get-user-details/${userId}`);
  }

  setPlayerScore(data: object) {
    return this.http.post(`${environment.API_URL}/users/set-score`, data);
  }

  updatePlayer(params: object) {
    return this.http.post(`${environment.API_URL}/users/update-user`,params);
  }

  getAgentTicketDetails(params: object) {
    return this.http.post(`${environment.API_URL}/user/get_agent_ticket_detail`, params);
  }

  // changeUserStatus(params: object) {
  //   return this.http.post(`${environment.API_URL}/user/change_user_status`, params);
  // }

  getCountryList() {
    return this.http.post(`${environment.API_URL}/common/country_list`, {});
  }

  getStateList(params: any) {
    return this.http.post(`${environment.API_URL}/common/state_list`, params);
  }

  editUsername(params: any) {
    return this.http.post(`${environment.API_URL}/user/change_user_name`, params);
  }

  getPortfolioDetail(params: object) {
    return this.http.post(`${environment.API_URL}/user/portfolio`, params);
  }

  getUserWatchList(params: object) {
    return this.http.post(`${environment.API_URL}/user/watchlist`, params);
  }

  createNewPlayer(params: object) {
    return this.http.post(`${environment.API_URL}/users/create`, params);
  }

  getUniquePlayerUserName() {
    return this.http.get(`${environment.API_URL}/users/fetch-player-username`);
  }
}
