import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChangePasswordComponent } from './change-password/change-password.component';
import { ChangeSecurityPasswordComponent } from './change-security-password/change-security-password.component';

const routes: Routes = [
  { path: 'change-password', component: ChangePasswordComponent },
  { path: 'change-security-password', component: ChangeSecurityPasswordComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PasswordRoutingModule { }

export const routedComponents: Array<any> = [
  ChangePasswordComponent,
  ChangeSecurityPasswordComponent
];
