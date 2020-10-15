import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { range, dateFormatString, formatDateTimeZone } from '../../services/utils.service';
import { USER_STATUS, KYC_STATUS } from '../constants';
import { Constants } from '../../constants';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { LoaderService } from '../../shared/loader/loader.service';


const INITIAL_PARAMS = {
  items_perpage: 20,
  current_page: 1,
  sort_field: 'name',
  sort_order: 'ASC',
  keyword: '',
  status: -1,
  user_id:'',
};
@Component({
  selector: 'app-user-watchlist',
  templateUrl: './user-watchlist.component.html',
  styleUrls: ['./user-watchlist.component.scss', '../../shared/scss/shared.scss']
})
export class UserWatchlistComponent implements OnInit, AfterViewInit {
  public params = localStorage.getItem('userwatchlistFilters')
    ? JSON.parse(localStorage.getItem('userwatchlistFilters'))
    : { ...INITIAL_PARAMS };
  public userwatchList = null;
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
    private loaderService: LoaderService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
 
     this.getUserWatchList();
    this.searchTextChanged.pipe(debounceTime(1000))
      .subscribe(model => this.getUserWatchList());
  }

  search() {
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

  

  public getUserWatchList() {
    this.loaderService.display(true);
    this.params.user_id= this.route.snapshot.paramMap.get('userId');
    this.userService.getUserWatchList(this.params)
      .subscribe((user: []) => {
        this.loaderService.display(false);
        // debugger;
        // console.log(user);
        if (user['data'] && user['data']) {
          this.userwatchList = user['data'].results;
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
    localStorage.setItem('userwatchlistFilters', JSON.stringify(this.params));
    this.getUserWatchList();
  }

  public nextOrPreviousPage(deviation: number) {
    this.params.current_page = this.params.current_page + deviation;
    localStorage.setItem('userwatchlistFilters', JSON.stringify(this.params));
    this.getUserWatchList();
  }

  public searchFilter(type?: string) {
    // this.params.current_page = 1;
    localStorage.setItem('userwatchlistFilters', JSON.stringify(this.params));
    if (type === 'reset') {
      this.params = { ...INITIAL_PARAMS };
      localStorage.removeItem('userwatchlistFilters');
    }
    this.params.current_page = 1;
    this.getUserWatchList();
  }

  // public startEdit(user) {
  //   this.currentUser = user;

  // }

  // public onStatusEdit(editStatus: any) {
  //   if (editStatus.success) {
  //     this.getUserWatchList();
  //     this.userList[this.currentUser.userIndex].status = this.currentUser.status;
  //     this.userList[this.currentUser.userIndex].balance = this.currentUser.balance;
  //   }
  // }
}
