import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DisputeService {
  constructor(private http: HttpClient) { }
  getDisputes(url: any) {
    return this.http.get(`${environment.API_URL}/${url}`);
  }

  getDisputeDetails(disputeId: string) {
    return this.http.post(`${environment.API_URL}/dispute/get_dispute_detail`, { dispute_id: disputeId });
  }

  changeDisputeStatus(params: object) {
    return this.http.post(`${environment.API_URL}/dispute/change_dispute_status`, params);
  }
  
}
