import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RedpacketService {
  private userObject = new BehaviorSubject({});
  currentUser = this.userObject.asObservable();

  constructor(private http: HttpClient) { }

  getRedPktList(url: string) {
    return this.http.get(`${environment.API_URL}/${url}`);
  }
  createRedPkt(data: object) {
    return this.http.post(`${environment.API_URL}/red-packet/create`, data);
  }
  editRedPkt(redPacketId:any , data: object) {
    return this.http.post(`${environment.API_URL}/red-packet/change-status/${redPacketId}`, data);
  }

  redPacketCategory() {
    return this.http.get(`${environment.API_URL}/red-packet/red-packet-category`);
  }

  updateCategoryTime(data: object) {
    return this.http.post(`${environment.API_URL}/red-packet/update-category-time`, data);
  }

  delete(data: object) {
    return this.http.post(`${environment.API_URL}/red-packet/delete-red-packet`, data);
  }

}