import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GameHistoryComponent } from './game-history/game-history.component';

const routes: Routes = [
  { path: '', component: GameHistoryComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GameLogRoutingModule { }

export const routedComponents: Array<any> = [
  GameHistoryComponent,
];
