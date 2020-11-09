import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GamesService {
  private userObject = new BehaviorSubject({});
  currentUser = this.userObject.asObservable();

  constructor(private http: HttpClient) { }

  getGames(url: any) {
    return this.http.get(`${environment.API_URL}/${url}`);
  }

  changeGameStatus(gameId: any, data: object) {
    return this.http.post(`${environment.API_URL}/game/change-game-status/${gameId}`, data);
  }

  getGameDetails(gameId: any) {
    return this.http.get(`${environment.API_URL}/game/get-game-details/${gameId}`);
  }

  getRedPktList(url: string) {
    return this.http.get(`${environment.API_URL}/${url}`);
  }
  createRedPkt(data: object) {
    return this.http.post(`${environment.API_URL}/red-packet/create`, data);
  }
  editRedPkt(redPacketId:any , data: object) {
    return this.http.post(`${environment.API_URL}/red-packet/change-status/${redPacketId}`, data);
  }
}
