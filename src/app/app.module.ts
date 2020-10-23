import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxCaptchaModule } from 'ngx-captcha';
import { ToastrModule } from 'ngx-toastr';
import * as bootstrap from 'bootstrap';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppRoutingModule } from './app-routing.module';


import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { FooterComponent } from './shared/footer/footer.component';

import { AuthorizationHeaderInterceptor, ErrorInterceptor } from './interceptors';

import { FantasyPipeModule } from './pipes/pipes.module';
import { DirectivesModule } from './directives/directives.module';
import { ImageCropperModule } from 'ngx-image-cropper';
import { LightboxModule } from 'ngx-lightbox';
import { NgSelectModule } from '@ng-select/ng-select';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';




@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NotFoundComponent,
    FooterComponent,

  ],
  imports: [
    DirectivesModule,
    AppRoutingModule,
    BrowserModule,
    CommonModule,
    FantasyPipeModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgxCaptchaModule,
    ImageCropperModule,
    LightboxModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      autoDismiss: true,
      closeButton: true,
      maxOpened: 1,
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpTranslateLoader,
        deps: [HttpClient]
      }
    }),
    NgSelectModule,
    CKEditorModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthorizationHeaderInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function httpTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
