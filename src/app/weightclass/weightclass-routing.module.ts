import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WeightclassListComponent } from './list/weightclass-list.component';
import { WeightclassNewComponent } from './new/weightclass-new.component';

const routes: Routes = [
     { path: '', component: WeightclassListComponent },
     { path: 'create-new', component: WeightclassNewComponent },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [
        RouterModule
    ]
})
export class WeightclassRoutingModule { }

export const routedComponents: Array<any> = [
    WeightclassListComponent,
];
