import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MatchesListComponent } from './list/matches-list.component';
import { MatchesStatsComponent } from './stats/matches-stats.component';
import { MatchesDetailsComponent } from './details/matches-details.component';
import { MatchesNewsComponent } from './news/matches-news.component';
import { MatchPlayerListComponent } from './players/match-players.component';
import { CreateMatchComponent } from './create-match/create-match.component';
import { MatchesEditComponent } from './edit/matches-edit.component';
import { AddFightResultComponent } from './add-fight-result/add-fight-result.component';

const routes: Routes = [
  { path: '', component: MatchesListComponent },
  { path: 'create', component: CreateMatchComponent },
  { path: ':matchId/details', component: MatchesDetailsComponent },
  { path: ':matchId/players', component: MatchPlayerListComponent },
  { path: ':matchId/news', component: MatchesNewsComponent },
  { path: ':matchId/edit', component: MatchesEditComponent },
  { path: ':matchId/fight/result', component: AddFightResultComponent },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class MatchesRoutingModule { }

export const routedComponents: Array<any> = [
  MatchesListComponent,
  CreateMatchComponent,
  MatchesStatsComponent,
  MatchesDetailsComponent,
  MatchesNewsComponent,
  MatchPlayerListComponent,
];
