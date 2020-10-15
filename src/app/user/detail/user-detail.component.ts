import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { formatDateTimeZone, dateFormatString } from '../../services/utils.service';
import { UserService } from '../../services/user.service';
import { USER_STATUS, KYC_STATUS } from '../constants';
import { Constants } from '../../constants';
import { LoaderService } from '../../shared/loader/loader.service';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit {

  public user = null;
  public error = false;
  public enableEdit = false;
  public username = '';
  public formatDateTimeZone = formatDateTimeZone;
  public dateFormatString = dateFormatString;
  public userStatus = USER_STATUS;
  public oldUserName = '';
  public currency_code = Constants.CURRENCY_CODE;
  imgURL: any;


  constructor(
    private userService: UserService, private route: ActivatedRoute, private toastr: ToastrService,
    private loaderService: LoaderService) { }

  ngOnInit() {
    this.getUserDetail();
  }

  private getUserDetail() {
    this.loaderService.display(true);
    const id = this.route.snapshot.paramMap.get('userId');
    this.userService.getUserDetails(id)
      .subscribe((user) => {
        this.loaderService.display(false);
        if (user['data']) {
          this.user = user['data'];
          this.oldUserName = this.user['user_name'];
          this.imgURL = environment.USER_IMG_URL+'/'+this.user['image'];  
        }
      }, (err: object) => {
        this.loaderService.display(false);
        this.error = true;
      });
  }

  // check it username is valid or not
  validUsername(event: any) {
    if ((event.key >= 'a' && event.key <= 'z') || (event.key >= 'A' && event.key <= 'Z')
      || (event.key >= '0' && event.key <= '9') || (event.key >= '_')) {
      return true;
    }
    return false;
  }

  public toggleEditUsername() {
    this.username = this.user.user_name || '';
    this.enableEdit = !this.enableEdit;
  }

  public formatDate(date) {
    if (date[date.length - 3] === '+') {
      return new Date(date + ':00');
    }
    return new Date(date);
  }

  public handleEdit() {
    if (!this.username.trim()) {
      this.toastr.error('Username can not be empty!');
      return;
    }
    if (this.username.length < 3) {
      this.toastr.error('Username must be at least 3 characters!');
      return;
    }
    this.loaderService.display(true);
    if (this.oldUserName !== this.username) {
      this.userService.editUsername({ user_unique_id: this.user.user_unique_id, user_name: this.username })
        .subscribe((res: any) => {
          this.loaderService.display(false);
          this.user.user_name = this.username;
          this.oldUserName = this.username;
          this.enableEdit = false;
          if (res && res.message) {
            this.toastr.success(res.message || 'Username updated successfully.');
          }

        }, (err: any) => {
          this.loaderService.display(false);
          if (err && err.error && err.error.message) {
            this.toastr.error(err.error.message || 'There was an error');
          }
          // this.username = this.user.user_name;
          // this.enableEdit = false;
        });
    } else {
      this.enableEdit = false;
      this.loaderService.display(false);
    }
  }
}
