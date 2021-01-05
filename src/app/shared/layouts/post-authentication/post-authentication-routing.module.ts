import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PostAuthenticationComponent } from './post-authentication.component';
import { AuthGuard } from '../../../auth-guard/auth.guard';
import { DashboardComponent } from '../../../dashboard/dashboard.component';
import { TransactionHistoryListComponent } from '../../../transaction-history/deposit/transaction-history-list.component';
import { WithdrawListComponent } from '../../../transaction-history/withdraw/withdraw-list.component';
import { TransactionHistoryAgentListComponent } from '../../../transaction-history/agent-list/transaction-history-agent-list.component';
import { JackpotTransactionComponent } from '../../../transaction-history/jackpot/list.component';
import { ScoringSportsComponent } from '../../../scoring/sports/scoring-sports.component';
import { TeamListComponent } from '../../../teams/list/teams-list.component';


const routes: Routes = [
    {
        path: '',
        component: PostAuthenticationComponent,
        canActivate: [AuthGuard],
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'users', loadChildren: () => import('../../../user/user.module').then(m => m.UserModule) },
            {
                path: 'agent',
                loadChildren: () => import('../../../agent/agent.module').then(m =>
                    m.AgentModule)
            },
            { path: 'leagues', loadChildren: () => import('../../../league/league.module').then(m => m.LeagueModule) },
            { path: 'matches', loadChildren: () => import('../../../matches/matches.module').then(m => m.MatchesModule) },
            // { path: 'teams', component: TeamListComponent },

            { path: 'news', loadChildren: () => import('../../../news/news.module').then(m => m.NewsModule) },

            // { path: 'events', loadChildren: () => import('../../../events/events.module').then(m => m.EventsModule) },

            // { path: 'promotions', loadChildren: () => import('../../../promotions/promotions.module').then(m => m.PromotionsModule) },

            // { path: 'weightclass', loadChildren: () => import('../../../weightclass/weightclass.module').then(m => m.WeightclassModule) },

            // { path: 'pages-list', loadChildren: () => import('../../../page-content/pages.module').then(m => m.PagesModule) },

            {
                path: 'advertisement',
                loadChildren: () => import('../../../advertisement/advertisement.module').then(m => m.AdvertisementModule)
            },
            { path: 'red-packet', loadChildren: () => import('../../../red-packet/red-pkt.module').then(m => m.RedPktModule) },

            // { path: 'contest', loadChildren: () => import('../../../contest/contest.module').then(m => m.ContestModule) },
            // { path: 'finances/transactions/deposit', component: TransactionHistoryListComponent },
            { path: 'finances/transactions/withdraw', component: WithdrawListComponent },
            // { path: 'finances/agent/transactions', component: TransactionHistoryAgentListComponent },
            // { path: 'finances/jackpot-transactions', component: JackpotTransactionComponent },
            {
                path: 'notifications', loadChildren: () => import('../../../notifications/notifications.module').
                    then(m => m.NotificationsModule)
            },
            // { path: 'disputes', loadChildren: () => import('../../../dispute/dispute.module').then(m => m.DisputeModule) },
            { path: 'players', loadChildren: () => import('../../../player/player.module').then(m => m.PlayerModule) },
            { path: 'password', loadChildren: () => import('../../../password/password.module').then(m => m.PasswordModule) },
            {
                path: 'player-loginip',
                loadChildren: () => import('../../../player-login-ip/player-login-ip.module').then(m => m.PlayerLoginIpModule)
            },
            { path: 'search-user', loadChildren: () => import('../../../search-user/search-user.module').then(m => m.SearchUserModule) },
            { path: 'game', loadChildren: () => import('../../../game/game.module').then(m => m.GameModule) },
            { path: 'score-log', loadChildren: () => import('../../../score-log/score-log.module').then(m => m.ScoreLogModule) },
            { path: 'game-log', loadChildren: () => import('../../../game-log/game-log.module').then(m => m.GameLogModule) },
            { path: 'jackpot', loadChildren: () => import('../../../jackpot/jackpot.module').then(m => m.JackpotModule) },

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
    TransactionHistoryListComponent,
    WithdrawListComponent,
    TransactionHistoryAgentListComponent,
    ScoringSportsComponent,
    JackpotTransactionComponent,
    TeamListComponent,
];
