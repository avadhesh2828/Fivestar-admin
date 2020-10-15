import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserListComponent } from './list/user-list.component';
import { UserDetailComponent } from './detail/user-detail.component';
import {UserPortfolioComponent} from './user-portfolio/user-portfolio.component';
import {UserWatchlistComponent} from './user-watchlist/user-watchlist.component';

const routes: Routes = [
    { path: ':userId', component: UserDetailComponent },
    { path: '', component: UserListComponent },
    { path: 'portfolio/:userId', component:UserPortfolioComponent},
    { path: 'watchlist/:userId', component:UserWatchlistComponent},

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
];
