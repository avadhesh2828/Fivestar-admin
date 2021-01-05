import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JackpotRoutingModule, routedComponents } from './jackpot-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FantasyPipeModule } from '../pipes/pipes.module';
import { PostAuthenticationModule } from '../shared/layouts/post-authentication/post-authentication.module';
import { DirectivesModule } from '../directives/directives.module';
import { ImageCropperModule } from 'ngx-image-cropper';
import { LightboxModule } from 'ngx-lightbox';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';


@NgModule({
  imports: [
    CommonModule,
    JackpotRoutingModule,
    FormsModule,
    FantasyPipeModule,
    PostAuthenticationModule,
    DirectivesModule,
    ReactiveFormsModule,
    BsDatepickerModule.forRoot(),
    ImageCropperModule,
    LightboxModule,
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
  providers: [
  ]
})
export class JackpotModule { }

export function httpTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, environment.LANG_URL, '.json');
}
