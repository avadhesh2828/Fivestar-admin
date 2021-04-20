import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class TransactionService {

  constructor(
    private http: HttpClient
  ) { }

  playerScoreLog(url: any, params: any) {
    return this.http.post(`${environment.API_URL}/${url}`, params);
  }


  getTransactions(url: any) {
    return this.http.get(`${environment.API_URL}/${url}`);
  }

  getWithdraws(url: any) {
    return this.http.get(`${environment.API_URL}/${url}`);
  }

  changeStatus(data: any) {
    return this.http.post(`${environment.API_URL}/finance/manage-withdraw-status`, data);
  }

  getAgentTransactions(params: any) {
    return this.http.post(`${environment.API_URL}/payment_transaction/get_all_agent_transaction`, params);
  }

  getJackpotTransactions(params: any) {
    return this.http.post(`${environment.API_URL}/payment_transaction/get_jackpot_transaction`, params);
  }

  gameRecall(params: any) {
    return this.http.post(`${environment.API_URL}/finance/game-recall`, params);
  }
}
