import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DisputeRoutingModule, routedComponents } from './dispute-routing.module';
import { FantasyPipeModule } from '../pipes/pipes.module';
import { EditDisputeComponent } from './edit-dispute/edit-dispute.component';
import { PostAuthenticationModule } from '../shared/layouts/post-authentication/post-authentication.module';
import { DirectivesModule } from '../directives/directives.module';


@NgModule({
    imports: [
        DisputeRoutingModule,
        CommonModule,
        FormsModule,
        FantasyPipeModule,
        PostAuthenticationModule,
        DirectivesModule,

    ],
    declarations: [
        ...routedComponents,
        EditDisputeComponent,
    ],
    providers: [
    ]
})
export class DisputeModule { }
