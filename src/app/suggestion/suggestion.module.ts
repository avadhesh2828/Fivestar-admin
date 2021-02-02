import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FantasyPipeModule } from '../pipes/pipes.module';
import { PostAuthenticationModule } from '../shared/layouts/post-authentication/post-authentication.module';
import { DirectivesModule } from '../directives/directives.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { SuggestionRoutingModule, routedComponents } from './suggestion-routing.module';


@NgModule({
  imports: [
    CommonModule,
    SuggestionRoutingModule,
    FormsModule,
    FantasyPipeModule,
    PostAuthenticationModule,
    DirectivesModule,
    ReactiveFormsModule,
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
export class SuggestionModule { }

export function httpTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, environment.LANG_URL, '.json');
}