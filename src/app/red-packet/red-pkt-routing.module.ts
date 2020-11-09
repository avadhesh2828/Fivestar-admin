import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RedPktNewComponent } from './new/red-pkt-new.component';
import { SuperAdminGuard } from '../auth-guard/super-admin.guard';
import { RedPktListComponent } from './list/red-pkt-list.component';

const routes: Routes = [
    { path: '', component: RedPktListComponent, canActivate: [SuperAdminGuard] },
    { path: 'new', component: RedPktNewComponent, canActivate: [SuperAdminGuard] },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [
        RouterModule
    ]
})
export class RedPktRoutingModule { }

export const routedComponents: Array<any> = [
    RedPktListComponent,
    RedPktNewComponent
];
