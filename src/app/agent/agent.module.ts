import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { AgentRoutingModule, routedComponents } from './agent-routing.module';
import { FantasyPipeModule } from '../pipes/pipes.module';
import { EditAgentComponent } from './edit-agent/edit-agent.component';
import { PostAuthenticationModule } from '../shared/layouts/post-authentication/post-authentication.module';
import { DirectivesModule } from '../directives/directives.module';
import { ImageCropperModule } from 'ngx-image-cropper';
import { LightboxModule } from 'ngx-lightbox';
import { UserModule } from '../user/user.module';


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
        UserModule

    ],
    declarations: [
        ...routedComponents,
        EditAgentComponent,
    ],
    providers: [
    ]
})
export class AgentModule { }
