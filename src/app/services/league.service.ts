import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class LeagueService {

  constructor(
    private http: HttpClient
  ) { }

  getAllLeagues() {
    return this.http.get(`${environment.API_URL}/common/get-leagues`);
  }

  getGameStyles(season_id) {
    return this.http.get(`${environment.API_URL}/common/get-game-styles/${season_id}`);
  }

  getSizes(league, gameStyle) {
    return this.http.get(`${environment.API_URL}/common/get-sizes/${league}/${gameStyle}`);
  }

  getLeague(league_id) {
    return this.http.get(`${environment.API_URL}/common/get-league/${league_id}`);
  }

  getGameStyle(master_game_style_id) {
    return this.http.get(`${environment.API_URL}/common/get-game-style/${master_game_style_id}`);
  }

  getAllSeasons(params: any) {
    return this.http.post(`${environment.API_URL}/player/get_all_seasons`, params);
  }

  getAllSeasonsYear(params: any) {
    return this.http.post(`${environment.API_URL}/player/get_all_seasons_year`, params);
  }
}
