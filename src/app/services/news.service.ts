import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NewsService {
  constructor(private http: HttpClient) { }

  getAllNews(url: any) {
    return this.http.get(`${environment.API_URL}/${url}`);
  }

  //adv
  createNews(params: object) {
    return this.http.post(`${environment.API_URL}/news/create_news`, params);
  }

  //change kyc status
  editAdvStatus(params:any)
  {
    return this.http.post(`${environment.API_URL}/advertisements/change_adv_status`, params);
  }

  uploadFileValidation(params:any)
  {
    return this.http.post(`${environment.API_URL}/news/do_upload`, params);
  }

  deleteNews(params: any) {
    return this.http.post(`${environment.API_URL}/news/delete_news`, params);
  }

  getNewsDetailById(newsId: string) {
    return this.http.post(`${environment.API_URL}/news/get_news_by_id`, { news_id: newsId });
  }
  updateNews(params: any) {
    return this.http.post(`${environment.API_URL}/news/update_news`, params);
  }
}
