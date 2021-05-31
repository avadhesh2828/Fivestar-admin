import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserListComponent } from './list/user-list.component';
import { UserDetailComponent } from './detail/user-detail.component';
import { UserPortfolioComponent } from './user-portfolio/user-portfolio.component';
import { UserWatchlistComponent } from './user-watchlist/user-watchlist.component';
import { NewComponent } from './new/new.component';
import { ReportsComponent } from './reports/reports.component';
import { PlayerRedpacketComponent } from './player-redpacket/player-redpacket.component';

const routes: Routes = [
    { path: '', component: UserListComponent },
    { path: 'new', component: NewComponent },
    { path: ':userId', component: UserDetailComponent },
    { path: 'reports/:userId', component: ReportsComponent },
    { path: 'player-redpacket/:userId', component: PlayerRedpacketComponent },
    { path: 'portfolio/:userId', component: UserPortfolioComponent },
    { path: 'watchlist/:userId', component: UserWatchlistComponent },

];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [
        RouterModule
    ]
})
export class UserRoutingModule { }

export const routedComponents: Array<any> = [
    UserListComponent,
    UserDetailComponent,
    UserPortfolioComponent,
    UserWatchlistComponent,
    NewComponent,
    ReportsComponent,
    PlayerRedpacketComponent,
];
