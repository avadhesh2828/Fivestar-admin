import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SaferGamblingService {
  constructor(private http: HttpClient) { }

  getUserPreferences(params: object) {
    return this.http.post(`${environment.API_URL}/safer_gambling/get_all_user_preferences`, params);
  }
}
