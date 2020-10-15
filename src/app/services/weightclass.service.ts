import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WeightclassService {
  constructor(private http: HttpClient) { }

  getAllWeightclass(url: any) {
    return this.http.get(`${environment.API_URL}/${url}`);
  }

//   getPromotion(params:any)
//   {
//     return this.http.post(`${environment.API_URL}/common/promotion_list`, params);
//   }

  createWeightclass(params: object) {
    return this.http.post(`${environment.API_URL}/weightclass/create`, params);
  }

  updateWeightclass(params: any) {
    return this.http.post(`${environment.API_URL}/weightclass/update`, params);
  }


  delete(params: any) {
    return this.http.post(`${environment.API_URL}/weightclass/delete`, params);
  }

}
