import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SuggestionService {

  private userObject = new BehaviorSubject({});
  currentUser = this.userObject.asObservable();
  constructor(private http: HttpClient) { }

  getSuggestion(url: any) {
    return this.http.get(`${environment.API_URL}/${url}`);
  }
}