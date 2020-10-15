import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdvertisementService {
  constructor(private http: HttpClient) { }

  getAllAdvPositions(params: object) {
    return this.http.post(`${environment.API_URL}/advertisements/get_positions`, params);
  }

  getAllAdvertisment(url: any) {
    return this.http.get(`${environment.API_URL}/${url}`);
  }

  //adv
  createAdv(params: object) {
    return this.http.post(`${environment.API_URL}/advertisements/create_advertisement`, params);
  }

  //change kyc status
  editAdvStatus(params:any)
  {
    return this.http.post(`${environment.API_URL}/advertisements/change_adv_status`, params);
  }

  uploadFileValidation(params:any)
  {
    return this.http.post(`${environment.API_URL}/advertisements/do_upload`, params);
  }

  deleteAdvertisment(params: any) {
    return this.http.post(`${environment.API_URL}/advertisements/delete_advertisement`, params);
  }
}
