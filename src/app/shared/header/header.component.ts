import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { UserService } from 'src/app/services/user.service';
import { TranslateService } from '@ngx-translate/core';


@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})

export class HeaderComponent implements OnInit {
    logo: any;
    readonly projectName = environment.Project_Name;
    user: any;
    myDate = new Date();
    imageURL = environment.IMG_URL;
    constructor(
        private authService: AuthService,
        private router: Router,
        private userService: UserService,
        public translate: TranslateService
    ) {
        this.userService.currentUser.subscribe((obj: any) => {
            if (this.userService.sizeOfObject(obj)) {
                this.user = obj;
                setInterval(() => {
                    this.myDate = new Date();
                }, 1000);
            }
        });
    }

    switchLang(lang: string) {
        this.translate.use(lang);
        localStorage.setItem('language', lang);
    }

    ngOnInit() {
        this.logo = environment.IMG_URL + '/logo.jpg';
        this.getDetails();
    }

    adminLogout() {
        this.authService.logout().pipe(first())
            .subscribe(() => {
                this.router.navigate(['/login']);
            }, err => { }
            );
    }

    getDetails() {
        this.authService.getUserDetails().subscribe((res: any) => {
            this.userService.updateUser(res.data);
        }, err => { });
    }

}
