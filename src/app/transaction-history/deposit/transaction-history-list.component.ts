import { Component, OnInit } from '@angular/core';

import { TransactionService } from '../../services/transaction.service';
import { formatDate, formatDateTimeZone, range } from '../../services/utils.service';
import { PAYMENT_FOR, PAYMENT_TYPE, STATUS } from '../constants';
import { Constants } from '../../constants';

const INITIAL_PARAMS = {
  per_page: 20,
  current_page: 1,
  payment_type: '',
  status: '',
  dates: [],
  keyword: ''
};

@Component({
  selector: 'app-transaction-history-list',
  templateUrl: './transaction-history-list.component.html',
  styleUrls: ['./transaction-history-list.component.scss', '../../shared/scss/shared.scss']
})
export class TransactionHistoryListComponent implements OnInit {
  public params: any = { ...INITIAL_PARAMS };
  public url: string = 'finance/deposit-list?';
  public transactionHistoryList = [];
  public totalTransactions = 0;
  public totalPaginationShow = [];
  public totalPages = 0;
  public error = false;
  public paymentFor = PAYMENT_FOR;
  public paymentType = PAYMENT_TYPE;
  public currency_code = Constants.CURRENCY_CODE;
  public isProcessed = STATUS;
  public formatDateTimeZone = formatDateTimeZone;
  public maxDate = new Date();
  constructor(
    private transactionService: TransactionService,
  ) { }

  ngOnInit() {
    this.getTransactionHistory();
  }

  private createUrl(date) {
    this.url = 'finance/deposit-list?';
    this.url += 'perPage=' + this.params.per_page + '&page=' + this.params.current_page + '&payment_type=' + this.params.payment_type + '&status=' + this.params.status + '&dates=' + JSON.stringify(date) + '&keyword=' + this.params.keyword;
  }

  private getTransactionHistory() {
    const date = this.params.dates.length == 2 ? {
      fromdate: `${formatDate(this.params.dates[0])} 00:00:00`,
      todate: `${formatDate(this.params.dates[1])} 23:59:59`,
      time_zone: this.params.dates[0].toString().split(' ')[5],
    } : [];
    this.createUrl(date);
    this.transactionService.getTransactions(this.url)
      .subscribe((response: any) => {
        if (response.response_code == 200) {
          this.transactionHistoryList = response.data.data;
          this.createPaginationItem(response.data.total);
        } else {
          this.transactionHistoryList = [];
        }
        this.error = false;
      }, () => {
        this.error = true;
      });
  }

  private createPaginationItem(totalTransactions: number) {
    this.totalTransactions = totalTransactions;
    const maxPages: number = Math.ceil(totalTransactions / this.params.per_page);
    const end = (this.params.current_page + 5) < maxPages ? this.params.current_page + 5 : maxPages;
    const start = (this.params.current_page - 5) > 1 ? this.params.current_page - 5 : 1;
    this.totalPages = maxPages;
    this.totalPaginationShow = range(end, start);
  }

  public paginateList(newPage: number) {
    if (this.params.current_page === newPage) { return false; }
    this.params.current_page = newPage;
    this.getTransactionHistory();
  }

  public nextOrPreviousPage(deviation: number) {
    this.params.current_page = this.params.current_page + deviation;
    this.getTransactionHistory();
  }

  public searchFilter(type?: string) {
    if (type === 'reset') {
      this.params = { ...INITIAL_PARAMS };
    }
    this.params.current_page = 1;
    this.getTransactionHistory();
  }

  public formatDate(date) {
    return date.replace(' ', 'T') + 'Z';
  }
}
