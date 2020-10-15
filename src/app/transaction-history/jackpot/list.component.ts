import { Component, OnInit } from '@angular/core';

import { TransactionService } from '../../services/transaction.service';
import { formatDate, formatDateTimeZone, range } from '../../services/utils.service';
import { JACKPOT_TYPE } from '../constants';

const INITIAL_PARAMS = {
  items_perpage: 20,
  current_page: 1,
  jackpot_type: '-1',
  dates: '',
  keyword: '',
};

@Component({
  selector: 'app-transaction-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss', '../../shared/scss/shared.scss']
})
export class JackpotTransactionComponent implements OnInit {
  public params: any = { ...INITIAL_PARAMS };
  public transactionHistoryList = null;
  public totalTransactions = 0;
  public totalPaginationShow = [];
  public totalPages = 0;
  public error = false;
  public jackpotType = JACKPOT_TYPE;

  public formatDateTimeZone = formatDateTimeZone;
  public maxDate = new Date();
  constructor(
    private transactionService: TransactionService,
  ) { }

  ngOnInit() {
    this.getTransactionHistory();
  }

  private getTransactionHistory() {
    const date = this.params.dates ? {
      fromdate: `${formatDate(this.params.dates[0])} 00:00:00`,
      todate: `${formatDate(this.params.dates[1])} 23:59:59`,
      time_zone: this.params.dates[0].toString().split(' ')[5],
    } : {};
    this.transactionService.getJackpotTransactions({ ...this.params, ...date })
      .subscribe((response: any) => {
        if (response.data && response.data.result) {
          this.transactionHistoryList = response.data.result;
          this.createPaginationItem(response.data.total);
        }
        this.error = false;
      }, () => {
        this.error = true;
      });
  }

  private createPaginationItem(totalTransactions: number) {
    this.totalTransactions = totalTransactions;
    const maxPages: number = Math.ceil(totalTransactions / this.params.items_perpage);
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
