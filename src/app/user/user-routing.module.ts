import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserListComponent } from './list/user-list.component';
import { UserDetailComponent } from './detail/user-detail.component';
import { NewComponent } from './new/new.component';
import { ReportsComponent } from './reports/reports.component';

const routes: Routes = [
    { path: '', component: UserListComponent },
    { path: 'new', component: NewComponent },
    { path: ':userId', component: UserDetailComponent },
    { path: 'reports/:userId', component: ReportsComponent }

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
    NewComponent,
    ReportsComponent,
];
