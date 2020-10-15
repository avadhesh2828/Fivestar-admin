import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotificationListComponent } from './list/notifications-list.component';
import { NotificationNewComponent } from './new/notifications-new.component';
import { AgentNotificationComponent } from './agent-notification/agent-notify.component';

const routes: Routes = [
  { path: '', component: NotificationListComponent },
  { path: 'new', component: NotificationNewComponent },
  { path: 'agent-notification', component: AgentNotificationComponent },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class NotificationRoutingModule { }

export const routedComponents: Array<any> = [
  NotificationListComponent,
  NotificationNewComponent,
  AgentNotificationComponent,
];
