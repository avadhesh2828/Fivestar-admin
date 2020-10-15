import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { PlayerRoutingModule, routedComponents } from './player-routing.module';
import { UiSwitchModule } from 'ngx-ui-switch';
import { FantasyPipeModule } from '../pipes/pipes.module';
import { EditPlayerComponent } from './edit-player/edit-player.component';
import { PostAuthenticationModule } from '../shared/layouts/post-authentication/post-authentication.module';
import { DirectivesModule } from '../directives/directives.module';
import { PlayerEditDetailsComponent } from './edit-player-details/player-edit-details.component';


@NgModule({
    imports: [
        PlayerRoutingModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        FantasyPipeModule,
        PostAuthenticationModule,
        DirectivesModule,
        UiSwitchModule,
        BsDatepickerModule.forRoot(),
        TimepickerModule.forRoot()

    ],
    declarations: [
        ...routedComponents,
        EditPlayerComponent,
        PlayerEditDetailsComponent,
    ],
    providers: [
    ]
})
export class PlayerModule { }
