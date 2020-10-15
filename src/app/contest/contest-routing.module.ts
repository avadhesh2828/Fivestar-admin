import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContestListComponent } from './list/contest-list.component';
import { ContestDetailComponent } from './detail/contest-detail.component';
import { ContestCreateLayoutComponent } from './new/create-layout/contest-create-layout.component';
import { CreateComponent } from './new/create/create.component';
import { CreateContestComponent } from './create-contest/create-contest.component';
import { EditContestComponent } from './edit-contest/edit-contest.component';

const routes: Routes = [
    // { path: 'layout', component: ContestCreateLayoutComponent },
    { path: 'create-new', component: CreateContestComponent },
    // { path: 'create/:league/:gameStyle', component: CreateComponent },
    { path: 'detail/:contestId', component: ContestDetailComponent },
    { path: 'edit/:contestId', component: EditContestComponent },
    { path: 'list', component: ContestListComponent },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [
        RouterModule
    ]
})
export class ContestRoutingModule { }

export const routedComponents: Array<any> = [
    ContestListComponent,
    CreateContestComponent,
    // ContestCreateLayoutComponent,
    // CreateComponent,
    ContestDetailComponent
];
