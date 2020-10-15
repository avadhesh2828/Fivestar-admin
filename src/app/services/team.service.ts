import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, throwError } from 'rxjs';

import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class TeamService {

  constructor(
    private http: HttpClient
  ) { }

  pre_team_data() {
    return this.http.post(`${environment.API_URL}/team/pre_team_data`, {});
  }

  getTeams(url: any) {
  	return this.http.get(`${environment.API_URL}/${url}`);
  }


}
