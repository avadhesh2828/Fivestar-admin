import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FantasyPipeModule } from '../pipes/pipes.module';
import { PostAuthenticationModule } from '../shared/layouts/post-authentication/post-authentication.module';
import { DirectivesModule } from '../directives/directives.module';
import { SearchUserRoutingModule, routedComponents } from './search-user-routing.module';


@NgModule({
  imports: [
    CommonModule,
    CommonModule,
    FormsModule,
    FantasyPipeModule,
    PostAuthenticationModule,
    DirectivesModule,
    ReactiveFormsModule,
    SearchUserRoutingModule,
    BsDatepickerModule.forRoot(),
  ],
  declarations: [
    ...routedComponents,
  ],
  providers: [
  ]
})
export class SearchUserModule { }