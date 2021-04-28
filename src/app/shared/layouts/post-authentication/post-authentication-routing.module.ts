import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PostAuthenticationComponent } from './post-authentication.component';
import { AuthGuard } from '../../../auth-guard/auth.guard';
import { DashboardComponent } from '../../../dashboard/dashboard.component';
import { WithdrawListComponent } from '../../../transaction-history/withdraw/withdraw-list.component';


const routes: Routes = [
    {
        path: '',
        component: PostAuthenticationComponent,
        canActivate: [AuthGuard],
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'users', loadChildren: () => import('../../../user/user.module').then(m => m.UserModule) },
            { path: 'agent', loadChildren: () => import('../../../agent/agent.module').then(m => m.AgentModule)},
            { path: 'advertisement', loadChildren: () => import('../../../advertisement/advertisement.module').then(m => m.AdvertisementModule)},
            { path: 'red-packet', loadChildren: () => import('../../../red-packet/red-pkt.module').then(m => m.RedPktModule) },
            { path: 'finances/transactions/withdraw', component: WithdrawListComponent },
            { path: 'notifications', loadChildren: () => import('../../../notifications/notifications.module').then(m => m.NotificationsModule) },
            { path: 'password', loadChildren: () => import('../../../password/password.module').then(m => m.PasswordModule) },
            { path: 'player-loginip', loadChildren: () => import('../../../player-login-ip/player-login-ip.module').then(m => m.PlayerLoginIpModule) },
            { path: 'search-user', loadChildren: () => import('../../../search-user/search-user.module').then(m => m.SearchUserModule) },
            { path: 'game', loadChildren: () => import('../../../game/game.module').then(m => m.GameModule) },
            { path: 'score-log', loadChildren: () => import('../../../score-log/score-log.module').then(m => m.ScoreLogModule) },
            { path: 'game-log', loadChildren: () => import('../../../game-log/game-log.module').then(m => m.GameLogModule) },
            { path: 'jackpot', loadChildren: () => import('../../../jackpot/jackpot.module').then(m => m.JackpotModule) },
            { path: 'suggestion', loadChildren: () => import('../../../suggestion/suggestion.module').then(m => m.SuggestionModule) },

        ]
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [
        RouterModule
    ]
})
export class PostAuthenticationRoutingModule { }

export const routedComponents: Array<any> = [
    DashboardComponent,
    PostAuthenticationComponent,
    WithdrawListComponent
];
