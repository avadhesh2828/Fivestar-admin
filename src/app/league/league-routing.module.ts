import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LeagueListComponent } from './list/league-list.component';
import {SeasonsListComponent} from './seasons/seasons-list.component';

const routes: Routes = [
    { path: '', component: LeagueListComponent },
    { path: ':leagueId', component: SeasonsListComponent },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [
        RouterModule
    ]
})
export class LeagueRoutingModule { }

export const routedComponents: Array<any> = [
    LeagueListComponent,
    SeasonsListComponent
];
