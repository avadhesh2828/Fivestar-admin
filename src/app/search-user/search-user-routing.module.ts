import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListComponent } from './list/list.component';
import { SetScoreComponent } from './set-score/set-score.component';

const routes: Routes = [
  { path: 'list', component: ListComponent },
  { path: ':userId', component: SetScoreComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SearchUserRoutingModule { }

export const routedComponents: Array<any> = [
  ListComponent,
  SetScoreComponent
];
