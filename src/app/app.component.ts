import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'frontend';

  constructor(
    public translate: TranslateService
  ) {
    translate.addLangs(['en', 'zh']);
    translate.setDefaultLang('en');
    localStorage.setItem('language', 'en');
  }
}
