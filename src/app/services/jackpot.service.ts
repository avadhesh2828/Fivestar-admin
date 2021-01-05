import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JackpotService {
  private userObject = new BehaviorSubject({});
  currentUser = this.userObject.asObservable();
  constructor(
    private http: HttpClient
  ) { }

  getJackpot(url: any) {
    return this.http.get(`${environment.API_URL}/${url}`);
  }

  update(data: object) {
    return this.http.post(`${environment.API_URL}/jackpot/update`, data);
  }

}