import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { QuillModule } from 'ngx-quill';

import { MatchesRoutingModule, routedComponents } from './matches-routing.module';
import { FantasyPipeModule } from '../pipes/pipes.module';
import { PostAuthenticationModule } from '../shared/layouts/post-authentication/post-authentication.module';
import { DirectivesModule } from '../directives/directives.module';
import { MatchesEditComponent } from './edit/matches-edit.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { AddFightResultComponent } from './add-fight-result/add-fight-result.component';

const toolbarOptions: any = [
  ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
  ['blockquote'],
  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
  ['clean'],                                         // remove formatting button
  ['link']                         // link
];

@NgModule({
  imports: [
    MatchesRoutingModule,
    CommonModule,
    FantasyPipeModule,
    BsDatepickerModule.forRoot(),
    TimepickerModule.forRoot(),
    PopoverModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    DirectivesModule,
    QuillModule.forRoot({
      bounds: '.custom-editor',
      modules: {
        toolbar: toolbarOptions,
      },
      scrollingContainer: '.custom-editor',
      placeholder: 'Add news for this match here ...'
    }),
    PostAuthenticationModule,
    NgSelectModule,
  ],
  declarations: [
    ...routedComponents,
    MatchesEditComponent,
    AddFightResultComponent,
  ]
})
export class MatchesModule { }
