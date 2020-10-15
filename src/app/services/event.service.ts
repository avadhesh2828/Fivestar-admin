import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EventService {
  constructor(private http: HttpClient) { }

  getAllEvents(url: any) {
    return this.http.get(`${environment.API_URL}/${url}`);
  }

  getPromotion(params:any)
  {
    return this.http.post(`${environment.API_URL}/common/promotion_list`, params);
  }

  getTournaments(eventDate) {
    return this.http.get(`${environment.API_URL}/events/get-matches?event_date=${eventDate}`);
  }

  //event
  createEvent(params: object) {
    return this.http.post(`${environment.API_URL}/events/create-event`, params);
  }

  getEventDetails(eventId: string) {
    return this.http.post(`${environment.API_URL}/events/get_event_by_id`, { event_id: eventId });
  }
  updateEvent(params: any) {
    return this.http.post(`${environment.API_URL}/events/update-event`, params);
  }


  deleteEvent(params: any) {
    return this.http.post(`${environment.API_URL}/events/delete-event`, params);
  }

}
