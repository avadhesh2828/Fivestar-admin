import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdvListComponent } from './list/adv-list.component';
import { AdvNewComponent } from './new/adv-new.component';
import { SuperAdminGuard } from '../auth-guard/super-admin.guard';

const routes: Routes = [
    { path: '', component: AdvListComponent, canActivate: [SuperAdminGuard] },
    { path: 'new', component: AdvNewComponent, canActivate: [SuperAdminGuard] },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [
        RouterModule
    ]
})
export class AdvertisementRoutingModule { }

export const routedComponents: Array<any> = [
    AdvListComponent,
    AdvNewComponent
];
