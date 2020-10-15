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

const INITIAL_PARAMS = {
  items_perpage: 20,
  current_page: 1,
  sort_field: 'name',
  sort_order: 'ASC',
  country: -1,
  keyword: '',
  status: -1,
  is_agent:0
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
  public dateFormatString = dateFormatString;
  public formatDateTimeZone = formatDateTimeZone;
  searchTextChanged: Subject<string> = new Subject<string>();

  constructor(
    private userService: UserService,
    private toastr: ToastrService,
    private loaderService: LoaderService
  ) { }

  ngOnInit() {
    this.getCountryList();
    // this.getUserList();
    this.searchTextChanged.pipe(debounceTime(1000))
      .subscribe(model => this.getUserList());
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

  public getCountryList() {
    this.userService.getCountryList()
      .subscribe((response: any) => {
        this.countryList = response.result;
        this.getUserList();
      },
      (err: any) => {
      if(err.status != 401) {
         this.toastr.error(err.message || 'There was an error.');
         this.error = true;
       }
      // }, (err: Error) => {
      //   this.toastr.error(err.message || 'There was an error.');
      //   this.error = true;
      });
  }

  public getUserList() {
    this.loaderService.display(true);
    this.userService.getUsers(this.params)
      .subscribe((user: []) => {
        this.loaderService.display(false);
        // console.log(user);
        if (user['data'] && user['data']) {
          this.userList = user['data'].result;
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
    const maxPages: number = Math.ceil(totalUSer / this.params.items_perpage);
    const end = (this.params.current_page + 5) < maxPages ? this.params.current_page + 5 : maxPages;
    const start = (this.params.current_page - 5) > 1 ? this.params.current_page - 5 : 1;
    this.totalPages = maxPages;
    this.totalPaginationShow = range(end, start);
  }

  public paginateList(newPage: number) {
    if (this.params.current_page === newPage) { return false; }
    this.params.current_page = newPage;
    localStorage.setItem('adminuserFilters', JSON.stringify(this.params));
    this.getUserList();
  }

  public nextOrPreviousPage(deviation: number) {
    this.params.current_page = this.params.current_page + deviation;
    localStorage.setItem('adminuserFilters', JSON.stringify(this.params));
    this.getUserList();
  }

    keyDownFunction(event) {
    if(event.keyCode == 13) {
      this.params.current_page = 1;
      this.searchTextChanged.next();
      // rest of your code
    }
  }

  public searchFilter(type?: string) {
    // this.params.current_page = 1;
    localStorage.setItem('adminuserFilters', JSON.stringify(this.params));
    if (type === 'reset') {

      this.params = { ...INITIAL_PARAMS };
      localStorage.removeItem('adminuserFilters');
    }
    this.params.current_page = 1;
    this.getUserList();
  }

  public startEdit(user) {
    this.currentUser = user;

  }

  public onStatusEdit(editStatus: any) {
    if (editStatus.success) {
      this.getUserList();
      this.userList[this.currentUser.userIndex].status = this.currentUser.status;
      this.userList[this.currentUser.userIndex].balance = this.currentUser.balance;
    }
  }
  get(obj, url) {
    const mapForm = document.createElement('form');
    mapForm.target = '_blank';
    mapForm.method = 'GET'; // or "post" if appropriate
    mapForm.action = url;
    Object.keys(obj).forEach(function (param) {
      const mapInput = document.createElement('input');
      mapInput.type = 'hidden';
      mapInput.name = param;
      mapInput.setAttribute('value', obj[param]);
      mapForm.appendChild(mapInput);
    });

    document.body.appendChild(mapForm);
    mapForm.submit();
  }

  public exportPDF(){
  this.get({
    }, environment.API_URL + '/user/export-pdf');
  }

  public exportExcel(){
    this.get({
      }, environment.API_URL + '/user/export-excel');
    }
}
