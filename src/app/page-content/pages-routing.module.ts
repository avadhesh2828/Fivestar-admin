import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PageListDetailsComponent } from './list/page-list-details.component';
import { PageEditDetailsComponent } from './edit/page-edit-details.component';

const routes: Routes = [
     { path: '', component: PageListDetailsComponent },
     { path: ':pageContentId', component: PageEditDetailsComponent },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [
        RouterModule
    ]
})
export class PageRoutingModule { }

export const routedComponents: Array<any> = [
    PageListDetailsComponent,
];
