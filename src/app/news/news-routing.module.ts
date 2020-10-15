import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewsListComponent } from './list/news-list.component';
import { NewsNewComponent } from './new/news-new.component';
import { NewsEditComponent } from './edit-news/news-edit.component';

const routes: Routes = [
     { path: '', component: NewsListComponent },
     { path: 'add', component: NewsNewComponent },
     { path: ':newsId', component: NewsEditComponent },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [
        RouterModule
    ]
})
export class NewsRoutingModule { }

export const routedComponents: Array<any> = [
    NewsListComponent,
];
