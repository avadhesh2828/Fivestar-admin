import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListComponent } from './list/list.component';
import { NewComponent } from './new/new.component';
import { DetailsComponent } from './details/details.component';

const routes: Routes = [
  { path: 'list', component: ListComponent },
  { path: ':gameId', component: DetailsComponent },
  { path: 'new', component: NewComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GameRoutingModule { }

export const routedComponents: Array<any> = [
  ListComponent,
  NewComponent,
  DetailsComponent
];
