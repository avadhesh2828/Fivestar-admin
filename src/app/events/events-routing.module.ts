import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


import { EventsListComponent } from './list/events-list.component';
import { EventsNewComponent } from './new/events-new.component';
import { EventDetailsComponent } from './details/event-details.component';
import { EventsEditComponent } from './edit/events-edit.component';

const routes: Routes = [
     { path: '', component: EventsListComponent },
     { path: 'create-new', component: EventsNewComponent },
     { path: ':eventId', component: EventDetailsComponent },
     { path: ':eventId/edit', component: EventsEditComponent },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [
        RouterModule
    ]
})
export class EventsRoutingModule { }

export const routedComponents: Array<any> = [
    EventsListComponent,
    EventsNewComponent,
];
