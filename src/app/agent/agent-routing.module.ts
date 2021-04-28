import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AgentListComponent } from './list/agent-list.component';
import { AgentDetailComponent } from './detail/agent-detail.component';
import { AgentNewComponent } from './new/agent-new.component';
import { EditAgentComponent } from './edit-agent/edit-agent.component';
import { SetScoreComponent } from './set-score/set-score.component';
import { ScoreLogComponent } from './score-log/score-log.component';
import { ReportsComponent } from './reports/reports.component';
import { AllReportComponent } from './all-report/all-report.component';

const routes: Routes = [
    { path: '', component: AgentListComponent },
    { path: 'new', component: AgentNewComponent },
    { path: ':agentId', component: AgentDetailComponent },
    { path: 'edit/:agentId', component: EditAgentComponent },
    { path: 'set-score/:agentId', component: SetScoreComponent },
    { path: 'score-log/:agentId', component: ScoreLogComponent },
    { path: 'report/:agentId', component: ReportsComponent },
    { path: 'all/:agentId', component: AllReportComponent },
    
   

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
    AgentDetailComponent,
    AgentNewComponent,
    EditAgentComponent,
    SetScoreComponent,
    ScoreLogComponent,
    ReportsComponent,
    AllReportComponent,
];
