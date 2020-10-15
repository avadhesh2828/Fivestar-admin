import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PagesContentService {
  constructor(private http: HttpClient) { }

  getAllPageList(url: any) {
    return this.http.get(`${environment.API_URL}/${url}`);
  }

  editPageContent(params:any)
  {
    return this.http.post(`${environment.API_URL}/pages-list/edit`, params);
  }

  updatePageContent(params:any)
  {
    return this.http.post(`${environment.API_URL}/pages-list/update`, params);
  }
}
