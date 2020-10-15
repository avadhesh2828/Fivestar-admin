import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { UiSwitchModule } from 'ngx-ui-switch';

import { ContestRoutingModule, routedComponents } from './contest-routing.module';
import { FantasyPipeModule } from '../pipes/pipes.module';
import { EditContestComponent } from './edit-contest/edit-contest.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { Ng5SliderModule } from 'ng5-slider';
import { DirectivesModule } from '../directives/directives.module';
import { PgaChampionshipComponent } from './new/leagues/pga/game-styles/pga-championship/pga-championship.component';
import { PrizingComponent } from './new/leagues/pga/prizing/prizing.component';
import { DraftingComponent } from './new/leagues/pga/drafting/drafting.component';
import { SchedulerComponent } from './new/leagues/pga/scheduler/scheduler.component';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
    imports: [
        ContestRoutingModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        BsDatepickerModule.forRoot(),
        TimepickerModule.forRoot(),
        UiSwitchModule,
        FantasyPipeModule,
        ImageCropperModule,
        Ng5SliderModule,
        DirectivesModule,
        NgSelectModule,
    ],
    declarations: [
        ...routedComponents,
        EditContestComponent,
        PgaChampionshipComponent,
        PrizingComponent,
        DraftingComponent,
        SchedulerComponent
    ],
    providers: [
    ]
})
export class ContestModule { }
