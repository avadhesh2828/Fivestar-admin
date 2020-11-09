import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NotificationRoutingModule, routedComponents } from './notifications-routing.module';
import { FantasyPipeModule } from '../pipes/pipes.module';
import { PostAuthenticationModule } from '../shared/layouts/post-authentication/post-authentication.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
@NgModule({
  imports: [
    NotificationRoutingModule,
    CommonModule,
    FantasyPipeModule,
    FormsModule,
    PostAuthenticationModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpTranslateLoader,
        deps: [HttpClient]
      }
    }),
  ],
  declarations: [
    ...routedComponents,
  ],
})
export class NotificationsModule { }
export function httpTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, environment.LANG_URL, '.json');
}
