import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(
    private http: HttpClient
  ) { }

  getNotifications(params: any) {
    return this.http.post(`${environment.API_URL}/notifications/get_all_notifications`, params);
  }

  createNotifications(params: any) {
    return this.http.post(`${environment.API_URL}/notifications/add_new_notification`, params);
  }
}
