import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class PlayerService {

  constructor(
    private http: HttpClient
  ) { }
  getAllTeams(params: any) {
    return this.http.post(`${environment.API_URL}/player/get_all_teams`, params);
  }
  getAllLeagues(params: any) {
    return this.http.post(`${environment.API_URL}/player/get_all_leagues`, params);
  }
  getAllPositions(params: any) {
    return this.http.post(`${environment.API_URL}/player/get_all_positions`, params);
  }
  getAllPlayers(url: any) {
    return this.http.get(`${environment.API_URL}/${url}`);
  }
  updatePlayer(data: any) {
    return this.http.post(`${environment.API_URL}/player/update_player`, data);
  }
  getPlayerDetails(params: string) {
    return this.http.post(`${environment.API_URL}/player/get_player_details`,params);
  }
  updatePlayerStatus(data: any) {
    return this.http.post(`${environment.API_URL}/player/update_player_status`, data);
  }
  uploadFileValidation(params:any)
  {
    return this.http.post(`${environment.API_URL}/player/do_upload`, params);
  }
  createPlayer(params:object)
  {
    return this.http.post(`${environment.API_URL}/player/create_player`, params);
  }
  editUpdatePlayer(params:object)
  {
    return this.http.post(`${environment.API_URL}/player/edit-update-player`, params);
  }
  deletePlayer(params:object)
  {
    return this.http.post(`${environment.API_URL}/player/delete-player`, params);
  }
  getAllFighterStatus(params:object)
  {
    return this.http.post(`${environment.API_URL}/player/get-player-status`, params);
  }
}
