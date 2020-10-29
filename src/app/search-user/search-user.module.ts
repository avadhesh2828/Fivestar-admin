import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FantasyPipeModule } from '../pipes/pipes.module';
import { PostAuthenticationModule } from '../shared/layouts/post-authentication/post-authentication.module';
import { DirectivesModule } from '../directives/directives.module';
import { SearchUserRoutingModule, routedComponents } from './search-user-routing.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';


@NgModule({
  imports: [
    CommonModule,
    CommonModule,
    FormsModule,
    FantasyPipeModule,
    PostAuthenticationModule,
    DirectivesModule,
    ReactiveFormsModule,
    SearchUserRoutingModule,
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
export class SearchUserModule { }
export function httpTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http);
}