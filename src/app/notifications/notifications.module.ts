import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NotificationRoutingModule, routedComponents } from './notifications-routing.module';
import { FantasyPipeModule } from '../pipes/pipes.module';
import { PostAuthenticationModule } from '../shared/layouts/post-authentication/post-authentication.module';

@NgModule({
  imports: [
    NotificationRoutingModule,
    CommonModule,
    FantasyPipeModule,
    FormsModule,
    PostAuthenticationModule,
  ],
  declarations: [
    ...routedComponents,
  ],
})
export class NotificationsModule { }
