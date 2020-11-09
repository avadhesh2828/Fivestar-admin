import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UserRoutingModule, routedComponents } from './user-routing.module';
import { FantasyPipeModule } from '../pipes/pipes.module';
import { EditUserComponent } from './edit-user/edit-user.component';
import { PostAuthenticationModule } from '../shared/layouts/post-authentication/post-authentication.module';
import { DirectivesModule } from '../directives/directives.module';
import { UserListComponent } from './list/user-list.component';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@NgModule({
    imports: [
        UserRoutingModule,
        CommonModule,
        FormsModule,
        FantasyPipeModule,
        PostAuthenticationModule,
        DirectivesModule,
        ReactiveFormsModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: httpTranslateLoader,
                deps: [HttpClient]
            }
        }),

    ],
    declarations: [
        ...routedComponents,
        EditUserComponent,
    ],
    exports: [
        UserListComponent,

    ],
    providers: [
    ]
})
export class UserModule { }
export function httpTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, environment.LANG_URL, '.json');
}
