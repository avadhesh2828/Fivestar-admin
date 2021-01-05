import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SuperAdminGuard } from '../auth-guard/super-admin.guard';
import { ListComponent } from './list/list.component';


const routes: Routes = [
  { path: '', component: ListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JackpotRoutingModule { }

export const routedComponents: Array<any> = [
    ListComponent
];
