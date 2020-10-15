import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { AdvertisementRoutingModule, routedComponents } from './advertisement-routing.module';
import { FantasyPipeModule } from '../pipes/pipes.module';
import { PostAuthenticationModule } from '../shared/layouts/post-authentication/post-authentication.module';
import { DirectivesModule } from '../directives/directives.module';
import { ImageCropperModule } from 'ngx-image-cropper';
import { LightboxModule } from 'ngx-lightbox';


@NgModule({
    imports: [
        AdvertisementRoutingModule,
        CommonModule,
        FormsModule,
        FantasyPipeModule,
        PostAuthenticationModule,
        DirectivesModule,
        ReactiveFormsModule,
        BsDatepickerModule.forRoot(),
        ImageCropperModule,
        LightboxModule,

    ],
    declarations: [
        ...routedComponents,
    ],
    providers: [
    ]
})
export class AdvertisementModule { }
