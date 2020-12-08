import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AgentListComponent } from './list/agent-list.component';
import { AgentPayoutComponent } from './payout/agent-payout.component';
import { AgentTicketInfoComponent } from './sold/agent-ticket-info.component';
import { AgentDetailComponent } from './detail/agent-detail.component';
import { AgentNewComponent } from './new/agent-new.component';
import { EditAgentComponent } from './edit-agent/edit-agent.component';
import { SetScoreComponent } from './set-score/set-score.component';

const routes: Routes = [
    { path: '', component: AgentListComponent },
    { path: 'new', component: AgentNewComponent },
    { path: 'payouts', component: AgentPayoutComponent },
    { path: ':agentId', component: AgentDetailComponent },
    { path: 'edit/:agentId', component: EditAgentComponent },
    { path: 'set-score/:agentId', component: SetScoreComponent },
    { path: 'tickets-info/:agentId', component: AgentTicketInfoComponent },
    
   

];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [
        RouterModule
    ]
})
export class AgentRoutingModule { }

export const routedComponents: Array<any> = [
    AgentListComponent,
    AgentPayoutComponent,
    AgentDetailComponent,
    AgentTicketInfoComponent,
    AgentNewComponent,
    EditAgentComponent,
    SetScoreComponent
];
