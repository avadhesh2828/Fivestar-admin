import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FantasyPipeModule } from '../pipes/pipes.module';
import { PostAuthenticationModule } from '../shared/layouts/post-authentication/post-authentication.module';
import { DirectivesModule } from '../directives/directives.module';
import { GameRoutingModule, routedComponents } from './game-routing.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { UiSwitchModule } from 'ngx-toggle-switch';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FantasyPipeModule,
    PostAuthenticationModule,
    DirectivesModule,
    ReactiveFormsModule,
    GameRoutingModule,
    UiSwitchModule,
    BsDatepickerModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpTranslateLoader,
        deps: [HttpClient]
      }
    }),
  ],
  declarations: [
    ...routedComponents
  ],
  providers: [
  ]
})
export class GameModule { }
export function httpTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, environment.LANG_URL, '.json');
}
