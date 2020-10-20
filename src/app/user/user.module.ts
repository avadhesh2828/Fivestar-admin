import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UserRoutingModule, routedComponents } from './user-routing.module';
import { FantasyPipeModule } from '../pipes/pipes.module';
import { EditUserComponent } from './edit-user/edit-user.component';
import { PostAuthenticationModule } from '../shared/layouts/post-authentication/post-authentication.module';
import { DirectivesModule } from '../directives/directives.module';



@NgModule({
    imports: [
        UserRoutingModule,
        CommonModule,
        FormsModule,
        FantasyPipeModule,
        PostAuthenticationModule,
        DirectivesModule,

    ],
    declarations: [
        ...routedComponents,
        EditUserComponent,
    ],
    providers: [
    ]
})
export class UserModule { }
