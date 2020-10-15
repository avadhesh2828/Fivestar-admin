import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PromotionService {
  constructor(private http: HttpClient) { }

  getAllPromotion(url: any) {
    return this.http.get(`${environment.API_URL}/${url}`);
  }

  getPromotion(params:any)
  {
    return this.http.post(`${environment.API_URL}/common/promotion_list`, params);
  }

  createPromotion(params: object) {
    return this.http.post(`${environment.API_URL}/promotion-create`, params);
  }

  updatePromotion(params: any) {
    return this.http.post(`${environment.API_URL}/promotion-update`, params);
  }


  delete(params: any) {
    return this.http.post(`${environment.API_URL}/promotion-delete`, params);
  }

}
