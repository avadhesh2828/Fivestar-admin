import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { AgentRoutingModule, routedComponents } from './agent-routing.module';
import { FantasyPipeModule } from '../pipes/pipes.module';
import { PostAuthenticationModule } from '../shared/layouts/post-authentication/post-authentication.module';
import { DirectivesModule } from '../directives/directives.module';
import { ImageCropperModule } from 'ngx-image-cropper';
import { LightboxModule } from 'ngx-lightbox';
import { UserModule } from '../user/user.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';


@NgModule({
    imports: [
        AgentRoutingModule,
        CommonModule,
        FormsModule,
        FantasyPipeModule,
        PostAuthenticationModule,
        DirectivesModule,
        ReactiveFormsModule,
        BsDatepickerModule.forRoot(),
        ImageCropperModule,
        LightboxModule,
        UserModule,
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
export class AgentModule { }
export function httpTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, environment.LANG_URL, '.json');
}
