import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-post-authentication',
  templateUrl: './post-authentication.component.html',
  styleUrls: ['./post-authentication.component.scss']
})
export class PostAuthenticationComponent implements OnInit {

  constructor(public translate: TranslateService) {
    translate.addLangs(['en', 'zh']);
    const localLang = localStorage.getItem('language');
    if (localLang) {
      translate.setDefaultLang(localLang);
    } else {
      translate.setDefaultLang('en');
    }
  }

  ngOnInit() {

  }

}
