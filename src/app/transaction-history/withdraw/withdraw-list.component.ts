import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../../services/transaction.service';
import { formatDate, formatDateTimeZone, range } from '../../services/utils.service';
import { PAYMENT_FOR, STATUS, ACTION_FOR } from '../constants';
import { Constants } from '../../constants';
import { ToastrService } from 'ngx-toastr';
import { LoaderService } from '../../shared/loader/loader.service';
import { UserService } from 'src/app/services/user.service';
import { Location } from '@angular/common';

const INITIAL_PARAMS = {
  per_page: 20,
  current_page: 1,
  withdraw_type: '',
  status: '',
  dates: [],
  keyword: ''
};

@Component({
  selector: 'app-withdraw-list',
  templateUrl: './withdraw-list.component.html',
  styleUrls: ['./withdraw-list.component.scss', '../../shared/scss/shared.scss']
})
export class WithdrawListComponent implements OnInit {
  public params: any = { ...INITIAL_PARAMS };
  public url = 'finance/withdraw-list?';
  public withdrawList = null;
  public currentUser = null;
  public totalWithdraws = 0;
  public totalPaginationShow = [];
  public totalPages = 0;
  public error = false;
  public paymentFor = PAYMENT_FOR;
  public currency_code = Constants.CURRENCY_CODE;
  public actionFor = ACTION_FOR;
  public isProcessed = STATUS;
  public formatDateTimeZone = formatDateTimeZone;
  public maxDate = new Date();
  public jump_to : any;
  public checkLastPage :any;
  constructor(
    private transactionService: TransactionService,
    private toastr: ToastrService,
    private loaderService: LoaderService,
    private userService: UserService,
    private location: Location,
  ) { }

  ngOnInit() {
    this.getWithdrawHistory();
    this.userService.currentUser.subscribe((usr: any) => {
      this.currentUser = usr;
    });
  }

  private createUrl(date) {
    this.url = 'finance/transaction-history?';
    this.url += 'perPage=' + this.params.per_page + '&page=' + this.params.current_page + '&status=' + this.params.status + '&dates=' + JSON.stringify(date) + '&keyword=' + this.params.keyword;
  }

  private getWithdrawHistory() {
    this.loaderService.display(true);
    const date = this.params.dates.length === 2 ? {
      fromdate: `${formatDate(this.params.dates[0])} 00:00:00`,
      todate: `${formatDate(this.params.dates[1])} 23:59:59`,
      time_zone: this.params.dates[0].toString().split(' ')[5],
    } : [];
    this.createUrl(date);
    this.transactionService.getWithdraws(this.url)
      .subscribe((response: any) => {
        this.loaderService.display(false);
        if (response['data'] && response['data'].data) {
          this.withdrawList = response['data'].data;
          this.checkLastPage = response['data'].last_page;
          this.jump_to = this.checkLastPage;
          this.createPaginationItem(response['data'].total);
        } else {
            this.withdrawList = response.data
          this.createPaginationItem(0);
        }
        this.error = false;
      }, () => {
        this.loaderService.display(false);
        this.error = true;
      });
  }

  public ChangeStatus(withdraw_details) {
    this.loaderService.display(true);
    this.transactionService.changeStatus({ 'withdraw_details': withdraw_details })
      .subscribe((response: any) => {
        if (response) {
          this.loaderService.display(false);
          this.getWithdrawHistory();
          this.toastr.success(response.message);
          // this.error = false;
        }
      }, (error) => {
        // this.error = true;
        this.toastr.error(error.error.global_error);
      });
  }


  private createPaginationItem(totalWithdraws: number) {
    this.totalWithdraws = totalWithdraws;
    const maxPages: number = Math.ceil(totalWithdraws / this.params.per_page);
    const end = (this.params.current_page + 5) < maxPages ? this.params.current_page + 5 : maxPages;
    const start = (this.params.current_page - 5) > 1 ? this.params.current_page - 5 : 1;
    this.totalPages = maxPages;
    this.totalPaginationShow = range(end, start);
  }

  public paginateList(newPage: number) {
    if (this.params.current_page === newPage) { return false; }
    this.params.current_page = newPage;
    this.getWithdrawHistory();
  }

  public nextOrPreviousPage(deviation: number) {
    this.params.current_page = this.params.current_page + deviation;
    this.getWithdrawHistory();
  }

  public searchFilter(type?: string) {
    if (type === 'reset') {
      this.params = { ...INITIAL_PARAMS };
    }
    this.params.current_page = 1;
    this.getWithdrawHistory();
  }

  public formatDate(date) {
    return date.replace(' ', 'T') + 'Z';
  }

  goBack() {
    this.location.back();
  }

  // jump page
  public jumpAnotherPage(checkLastPage) {
    if(checkLastPage >= this.jump_to) {
      this.params.current_page = this.jump_to;
      this.getWithdrawHistory();
    } 
  }

}
