import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotificationListComponent } from './list/notifications-list.component';
import { NotificationNewComponent } from './new/notifications-new.component';
import { AgentNotificationComponent } from './agent-notification/agent-notify.component';
import { SuperAdminGuard } from '../auth-guard/super-admin.guard';

const routes: Routes = [
  { path: '', component: NotificationListComponent, canActivate: [SuperAdminGuard] },
  { path: 'new', component: NotificationNewComponent, canActivate: [SuperAdminGuard] },
  { path: 'agent-notification', component: AgentNotificationComponent, canActivate: [SuperAdminGuard] },
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
