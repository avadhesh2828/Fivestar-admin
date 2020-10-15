import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PromotionsListComponent } from './list/promotions-list.component';
import { PromotionsNewComponent } from './new/promotions-new.component';

const routes: Routes = [
     { path: '', component: PromotionsListComponent },
     { path: 'create-new', component: PromotionsNewComponent },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [
        RouterModule
    ]
})
export class PromotionsRoutingModule { }

export const routedComponents: Array<any> = [
    PromotionsListComponent,
];
