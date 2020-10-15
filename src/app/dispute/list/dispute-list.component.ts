import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { DisputeService } from '../../services/dispute.service';
import { range, dateFormatString, formatDateTimeZone } from '../../services/utils.service';
import { DISPUTE_STATUS } from '../constants';
import { Constants } from '../../constants';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { LoaderService } from '../../shared/loader/loader.service';

const INITIAL_PARAMS = {
  per_page: 20,
  current_page: 1,
  sort_field: 'name',
  sort_order: 'ASC',
  keyword: '',
  status: -1,
};
@Component({
  selector: 'app-dispute-list',
  templateUrl: './dispute-list.component.html',
  styleUrls: ['./dispute-list.component.scss', '../../shared/scss/shared.scss']
})
export class DisputeListComponent implements OnInit, AfterViewInit {
  public params = localStorage.getItem('disputeFilters')
    ? JSON.parse(localStorage.getItem('disputeFilters'))
    : { ...INITIAL_PARAMS };
  public disputeList = null;
  public totalDisputes = 0;
  public totalPaginationShow = [];
  public totalPages = 0;
  public disputeStatus = DISPUTE_STATUS;
  public currency_code = Constants.CURRENCY_CODE;
  public error = false;
  public currentDispute = null;
  public countryList = [];
  public dateFormatString = dateFormatString;
  public formatDateTimeZone = formatDateTimeZone;
  searchTextChanged: Subject<string> = new Subject<string>();
  public url: string = 'disputes?';

  constructor(
    private disputeService: DisputeService,
    private toastr: ToastrService,
    private loaderService: LoaderService
  ) { }

  ngOnInit() {
    //this.getDisputeList();
    this.getDisputeList();
    localStorage.removeItem('disputeFilters');
    this.searchTextChanged.pipe(debounceTime(1000))
      .subscribe(model => this.getDisputeList());
  }

   private createUrl() {
    this.url = 'disputes?';
    this.url += 'per_page=' + this.params.per_page + '&page=' + this.params.current_page + '&status=' + this.params.status + '&keyword=' + this.params.keyword;
  }

  search() {
    this.params.current_page = 1;
    this.searchTextChanged.next();
  }


  ngAfterViewInit() {
    const that = this;
    // Listen for bootstrap modal's hidden event to reset form
    $('#editModal').on('hidden.bs.modal', function () {
      that.currentDispute = null;
      $(this).find('textarea').val('').end();
    });
  }


  public getDisputeList() {
    this.loaderService.display(true);
    this.createUrl();
    this.disputeService.getDisputes(this.url)
      .subscribe((dispute:[]) => {
        this.loaderService.display(false);
        if (dispute['data'] && dispute['data']) {
          this.disputeList = dispute['data'];
          this.createPaginationItem(dispute['data'].total);
        }
        this.error = false;
      }, (err: Error) => {
        this.loaderService.display(false);
        this.error = true;
      });
  }

  private createPaginationItem(totalDisputes: number) {
    this.totalDisputes = totalDisputes;
    const maxPages: number = Math.ceil(totalDisputes / this.params.per_page);
    const end = (this.params.current_page + 5) < maxPages ? this.params.current_page + 5 : maxPages;
    const start = (this.params.current_page - 5) > 1 ? this.params.current_page - 5 : 1;
    this.totalPages = maxPages;
    this.totalPaginationShow = range(end, start);
  }

  public paginateList(newPage: number) {
    if (this.params.current_page === newPage) { return false; }
    this.params.current_page = newPage;
    localStorage.setItem('disputeFilters', JSON.stringify(this.params));
    this.getDisputeList();
  }

  public nextOrPreviousPage(deviation: number) {
    this.params.current_page = this.params.current_page + deviation;
    localStorage.setItem('disputeFilters', JSON.stringify(this.params));
    this.getDisputeList();
  }

  public searchFilter(type?: string) {
    localStorage.setItem('disputeFilters', JSON.stringify(this.params));
    if (type === 'reset') {
      this.params = { ...INITIAL_PARAMS };
      localStorage.removeItem('disputeFilters');
    }
    this.params.current_page = 1;
    this.getDisputeList();
  }

  public startEdit(dispute) {
    this.currentDispute = dispute;

  }

  public onStatusEdit(editStatus: any) {
    if (editStatus.success) {
      this.disputeList[this.currentDispute.disputeIndex].status = this.currentDispute.status;
    }
  }
}
