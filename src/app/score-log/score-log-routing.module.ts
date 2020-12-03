import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SetScoreComponent } from './set-score/set-score.component';
import { LogComponent } from './log/log.component';

const routes: Routes = [
  { path: '', component: LogComponent },
  { path: ':playerId', component: SetScoreComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScoreLogRoutingModule { }

export const routedComponents: Array<any> = [
  SetScoreComponent,
  LogComponent
];
