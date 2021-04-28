import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { UserService } from '../../services/user.service';
import { range, dateFormatString, formatDateTimeZone } from '../../services/utils.service';
import { USER_STATUS, KYC_STATUS } from '../constants';
import { Constants } from '../../constants';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { LoaderService } from '../../shared/loader/loader.service';
import { environment } from '../../../environments/environment';
import { ActivatedRoute } from '@angular/router';

const INITIAL_PARAMS = {
  per_page: 10,
  current_page: 1,
  status: '',
};
@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss', '../../shared/scss/shared.scss']
})
export class UserListComponent implements OnInit, AfterViewInit {
  public params = localStorage.getItem('adminuserFilters')
    ? JSON.parse(localStorage.getItem('adminuserFilters'))
    : { ...INITIAL_PARAMS };
  formSubmitted = false;
  public userList = null;
  public totalUsers = 0;
  public totalPaginationShow = [];
  public totalPages = 0;
  public userStatus = USER_STATUS;
  public currency_code = Constants.CURRENCY_CODE;
  public kycStatus = KYC_STATUS;
  public error = false;
  public currentUser = null;
  public countryList = [];
  public currentAgent : any = null;
  public dateFormatString = dateFormatString;
  public formatDateTimeZone = formatDateTimeZone;
  public url = 'users/list?';
  selectedUser: any = '';
  selectedAgent: any = '';
  public jump_to : any;
  public checkLastPage :any;
  searchTextChanged: Subject<string> = new Subject<string>();

  constructor(
    private userService: UserService,
    private toastr: ToastrService,
    private loaderService: LoaderService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    if(this.route.snapshot.paramMap.get('agentId') == '' ||  this.route.snapshot.paramMap.get('agentId') ==  null ) {
      this.selectedAgent = '';
    } else {
      this.selectedAgent = this.route.snapshot.paramMap.get('agentId');
    }
    
    this.userService.currentUser.subscribe((current_agent: any) => {
      this.currentAgent = current_agent;
    });

    // this.getAgentsList();
    this.getUsersList();
    this.searchTextChanged.pipe(debounceTime(1000))
      .subscribe(model => this.getUsersList());
  }

  search() {
    // debugger;

    this.params.current_page = 1;
    this.searchTextChanged.next();
  }


  ngAfterViewInit() {
    const that = this;
    // Listen for bootstrap modal's hidden event to reset form
    $('#editModal').on('hidden.bs.modal', function () {
      that.currentUser = null;
      $(this).find('textarea').val('').end();
    });
  }

  public players(status:any) {
    this.selectedUser = status;
    this.getUsersList();
  }

  private createUrl() {
    this.url = 'users/list?';
    this.url += 'per_page=' + this.params.per_page + '&page=' + this.params.current_page + '&status=' + this.selectedUser + '&parent_id=' +this.selectedAgent;
  }

  public getUsersList() {
    this.loaderService.display(true);
    this.createUrl();
    this.userService.getAgents(this.url)
      .subscribe((user: []) => {
        this.loaderService.display(false);
        if (user['data'] && user['data']) {
          this.userList = user['data'].data;
          this.checkLastPage = user['data'].last_page;
          this.jump_to = this.checkLastPage;
          this.createPaginationItem(user['data'].total);
        }
        this.error = false;
      }, (err: Error) => {
        this.loaderService.display(false);
        this.error = true;
      });
  }

  private createPaginationItem(totalUSer: number) {
    this.totalUsers = totalUSer;
    const maxPages: number = Math.ceil(totalUSer / this.params.per_page);
    const end = (this.params.current_page + 5) < maxPages ? this.params.current_page + 5 : maxPages;
    const start = (this.params.current_page - 5) > 1 ? this.params.current_page - 5 : 1;
    this.totalPages = maxPages;
    this.totalPaginationShow = range(end, start);
  }

  public paginateList(newPage: number) {
    if (this.params.current_page === newPage) { return false; }
    this.params.current_page = newPage;
    this.getUsersList();
  }

  public nextOrPreviousPage(deviation: number) {
    this.params.current_page = this.params.current_page + deviation;
    this.getUsersList();
  }

  public checkSubAgent(user: any) {
    this.selectedUser = user.user_id;
    this.getUsersList();
  }

  public changeplayerStatus(agentId: any, status: any) {
    this.formSubmitted = true;
    const forminputdata = {
      status : status
    };    
    this.userService.changeUserStatus(agentId, forminputdata).pipe()
      .subscribe((res: any) => {
        this.formSubmitted = false;
        this.toastr.success(res.message || 'User status changed Sucessfully.');
        this.getUsersList();
      }, err => {
        const errorMessage = '';
        this.toastr.error(errorMessage || err.error.global_error || err.error.message || 'Some error occurred while change user status.');
        this.formSubmitted = false;
      });

  }

  keyDownFunction(event) {
    if (event.keyCode === 13) {
      this.params.current_page = 1;
      this.searchTextChanged.next();
      // rest of your code
    }
  }

  public startEdit(user) {
    this.currentUser = user;

  }

  public onStatusEdit(editStatus: any) {
    if (editStatus.success) {
      this.getUsersList();
      this.userList[this.currentUser.userIndex].status = this.currentUser.status;
      this.userList[this.currentUser.userIndex].balance = this.currentUser.balance;
    }
  }

  // jump page
  public jumpAnotherPage(checkLastPage) {
    if(checkLastPage >= this.jump_to) {
      this.params.current_page = this.jump_to;
      this.getUsersList();
    } 
  }
}
