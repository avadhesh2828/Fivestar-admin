import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

import { HeaderComponent } from '../../header/header.component';
import { PostAuthenticationRoutingModule, routedComponents } from './post-authentication-routing.module';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { LoaderService } from '../../../shared/loader/loader.service';
import { LoaderComponent } from '../../../shared/loader/loader.component';
import { DirectivesModule } from '../../../directives/directives.module';


@NgModule({
  imports: [
    CommonModule,
    PostAuthenticationRoutingModule,
    BsDatepickerModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    DirectivesModule
  ],
  declarations: [
    routedComponents,
    HeaderComponent,
    SidebarComponent,
    LoaderComponent,
  ],
  providers: [
    LoaderService,
  ],
  exports: [
    LoaderComponent,
  ],
})
export class PostAuthenticationModule { }
