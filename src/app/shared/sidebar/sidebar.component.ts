import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { UserService } from 'src/app/services/user.service';
import { first } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';



@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, AfterViewInit {
  contest_type: any;
  newsIcon: any;
  fighterIcon: any;
  fightIcon: any;
  contestIcon: any;
  isSuperAdmin: boolean;

  constructor(private userService: UserService, private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.newsIcon = environment.IMG_URL + '/news.png';
    this.fighterIcon = environment.IMG_URL + '/fighter.png';
    this.fightIcon = environment.IMG_URL + '/fight.png';
    this.contestIcon = environment.IMG_URL + '/contest.png';

    this.userService.currentUser.subscribe((obj: any) => {
      if (this.userService.sizeOfObject(obj)) {
        this.isSuperAdmin = obj.role_id === 1 ? true : false;
      }
    });
  }

  ngAfterViewInit() {
    $('.nav-clickable-item a').on('click', function () {
      $('.nav').find('.active').removeClass('active');
      $(this).addClass('active');
    });
  }

  adminLogout() {
    this.authService.logout().pipe(first())
        .subscribe(() => {
            this.router.navigate(['/login']);
        }, err => { }
        );
  }

}
