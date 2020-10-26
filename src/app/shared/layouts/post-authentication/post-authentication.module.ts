import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { HttpClient } from '@angular/common/http';


import { HeaderComponent } from '../../header/header.component';
import { PostAuthenticationRoutingModule, routedComponents } from './post-authentication-routing.module';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { LoaderService } from '../../../shared/loader/loader.service';
import { LoaderComponent } from '../../../shared/loader/loader.component';
import { DirectivesModule } from '../../../directives/directives.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';


@NgModule({
  imports: [
    CommonModule,
    PostAuthenticationRoutingModule,
    BsDatepickerModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    DirectivesModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpTranslateLoader,
        deps: [HttpClient]
      }
    }),
  ],
  declarations: [
    routedComponents,
    HeaderComponent,
    SidebarComponent,
    LoaderComponent,
  ],
  providers: [
    LoaderService,
  ],
  exports: [
    LoaderComponent
  ],
})
export class PostAuthenticationModule { }

export function httpTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
