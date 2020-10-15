import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { EventsRoutingModule, routedComponents } from './events-routing.module';
import { FantasyPipeModule } from '../pipes/pipes.module';
import { PostAuthenticationModule } from '../shared/layouts/post-authentication/post-authentication.module';
import { DirectivesModule } from '../directives/directives.module';
import { ImageCropperModule } from 'ngx-image-cropper';
import { LightboxModule } from 'ngx-lightbox';
import { EventsNewComponent } from './new/events-new.component';
import { EventDetailsComponent } from './details/event-details.component';
import { EventsEditComponent } from './edit/events-edit.component';


@NgModule({
    imports: [
        EventsRoutingModule,
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
        EventsNewComponent,
        EventDetailsComponent,
        EventsEditComponent,
    ],
    providers: [
    ]
})
export class EventsModule { }
