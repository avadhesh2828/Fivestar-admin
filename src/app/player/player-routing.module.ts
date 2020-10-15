import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PlayerListComponent } from './list/player-list.component';
import { PlayerDetailComponent } from './detail/player-detail.component';
import { CreatePlayerComponent } from './create-player/create-player.component';
import { PlayerEditDetailsComponent } from './edit-player-details/player-edit-details.component';

const routes: Routes = [
    { path: 'create', component: CreatePlayerComponent },
    { path: ':playerId', component: PlayerDetailComponent },
    { path: 'edit/player/details/:playerId', component: PlayerEditDetailsComponent },
    { path: '', component: PlayerListComponent }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [
        RouterModule
    ]
})
export class PlayerRoutingModule { }

export const routedComponents: Array<any> = [
    PlayerListComponent,
    CreatePlayerComponent,
    PlayerDetailComponent,
];
