import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DisputeListComponent } from './list/dispute-list.component';
import { DisputeDetailComponent } from './detail/dispute-detail.component';

const routes: Routes = [
    { path: ':disputeId', component: DisputeDetailComponent },
    { path: '', component: DisputeListComponent },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [
        RouterModule
    ]
})
export class DisputeRoutingModule { }

export const routedComponents: Array<any> = [
    DisputeListComponent,
    DisputeDetailComponent,
];
