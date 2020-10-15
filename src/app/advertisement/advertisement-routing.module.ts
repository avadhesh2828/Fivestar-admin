import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdvListComponent } from './list/adv-list.component';
import { AdvNewComponent } from './new/adv-new.component';

const routes: Routes = [
     { path: '', component: AdvListComponent },
     { path: 'new', component: AdvNewComponent },
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
