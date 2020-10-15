import { Component, OnInit } from '@angular/core';

import { TransactionService } from '../../services/transaction.service';
import { formatDate, formatDateTimeZone, range } from '../../services/utils.service';
import { PAYMENT_FOR, PAYMENT_TYPE, STATUS } from '../constants';
import { Constants } from '../../constants';

const INITIAL_PARAMS = {
  items_perpage: 20,
  current_page: 1,
  payment_type: '-1',
  dates: '',
  payment_for: '-1',
  keyword: '',
  is_processed: '-1',
};

@Component({
  selector: 'app-transaction-history-list',
  templateUrl: './transaction-history-agent-list.component.html',
  styleUrls: ['./transaction-history-agent-list.component.scss', '../../shared/scss/shared.scss']
})
export class TransactionHistoryAgentListComponent implements OnInit {
  public params: any = { ...INITIAL_PARAMS };
  public transactionHistoryList = null;
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

  private getTransactionHistory() {
    const date = this.params.dates ? {
      fromdate: `${formatDate(this.params.dates[0])} 00:00:00`,
      todate: `${formatDate(this.params.dates[1])} 23:59:59`,
      time_zone: this.params.dates[0].toString().split(' ')[5],
    } : {};
    this.transactionService.getAgentTransactions({ ...this.params, ...date })
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
