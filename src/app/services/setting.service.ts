import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  private userObject = new BehaviorSubject({});
  currentUser = this.userObject.asObservable();

  constructor(private http: HttpClient) { }

  getVersion() {
    return this.http.get(`${environment.API_URL}/setting/get-version`);
  }
  updateVersion(versionId:any , data: object) {
    return this.http.post(`${environment.API_URL}/setting/update-version/${versionId}`, data);
  }

}