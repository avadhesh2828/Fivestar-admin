import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FantasyPipeModule } from '../pipes/pipes.module';
import { PostAuthenticationModule } from '../shared/layouts/post-authentication/post-authentication.module';
import { DirectivesModule } from '../directives/directives.module';
import { PlayerLoginIpRoutingModule, routedComponents } from './player-login-ip-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FantasyPipeModule,
    PostAuthenticationModule,
    DirectivesModule,
    ReactiveFormsModule,
    PlayerLoginIpRoutingModule,
    BsDatepickerModule.forRoot(),
  ],
  declarations: [
    ...routedComponents
  ],
  providers: [
  ]
})
export class PlayerLoginIpModule { }