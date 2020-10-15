import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})

export class HeaderComponent implements OnInit {
    logo: any;
    readonly projectName = environment.Project_Name;
    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit() { 
        this.logo = environment.IMG_URL+'/logo.jpg'
    }

    adminLogout() {
        this.authService.logout().pipe(first())
            .subscribe( () => {
                    this.router.navigate(['/login']);
                }, err => { }
            );
    }

}
