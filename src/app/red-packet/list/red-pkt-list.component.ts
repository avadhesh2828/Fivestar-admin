import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';

import { range, dateFormatString, formatDateTimeZone } from '../../services/utils.service';
import { ADVERTISMENT_STATUS } from '../constants';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { LoaderService } from '../../shared/loader/loader.service';
import { Constants } from '../../constants';
import { SubscriptionService } from '../../services/subscription.service';
import { TranslateService } from '@ngx-translate/core';
import { GamesService } from '../../services/games.service';

const INITIAL_PARAMS = {
  per_page: 20,
  current_page: 1
};
@Component({
  selector: 'app-red-pkt-list',
  templateUrl: './red-pkt-list.component.html',
  styleUrls: ['./red-pkt-list.component.scss', '../../shared/scss/shared.scss']
})
export class RedPktListComponent implements OnInit, AfterViewInit {
  public params = { ...INITIAL_PARAMS };
  public advList = null;
  public totalAdv = 0;
  public totalPaginationShow = [];
  public totalPages = 0;
  public enableEdit = false;
  public oldStatus = '';
  public adv_status = '';
  public advertisment_status = '';
  public AdvStatus = ADVERTISMENT_STATUS;
  public currency_code = Constants.CURRENCY_CODE;
  public error = false;
  public currentAgent = null;
  public countryList = [];
  public dateFormatString = dateFormatString;
  public formatDateTimeZone = formatDateTimeZone;
  public currentAdv: any;
  public url = 'red-packet/list?';

  searchTextChanged: Subject<string> = new Subject<string>();

  constructor(
    private gameService: GamesService,
    private toastr: ToastrService,
    private loaderService: LoaderService,
    private location: Location,
    public subscriptionService: SubscriptionService,
    public translate: TranslateService,
  ) {
    this.subscriptionService.language.subscribe((lang) => {
      this.translate.setDefaultLang(lang);  // this will happen on every change
    });
  }

  ngOnInit() {
    this.params = localStorage.getItem('agentFilters')
      ? JSON.parse(localStorage.getItem('agentFilters'))
      : { ...INITIAL_PARAMS };
    localStorage.removeItem('agentFilters');
    this.getRedPktList();
    this.searchTextChanged.pipe(debounceTime(1000))
      .subscribe(model => this.getRedPktList());
  }

  search() {
    this.params.current_page = 1;
    this.searchTextChanged.next();
  }

  private createUrl() {
    this.url = 'red-packet/list?';
    this.url += 'per_page=' + this.params.per_page + '&page=' + this.params.current_page;
  }

  ngAfterViewInit() {
    const that = this;
    // Listen for bootstrap modal's hidden event to reset form
    $('#editModal').on('hidden.bs.modal', function () {
      that.currentAgent = null;
      $(this).find('textarea').val('').end();
    });
  }

  goBack() {
    this.location.back();
  }

  public getRedPktList() {
    this.loaderService.display(true);
    this.createUrl();
    this.gameService.getRedPktList(this.url)
      .subscribe((adv: []) => {
        this.loaderService.display(false);
        if (adv['data'] && adv['data'].data) {
          this.advList = adv['data'].data;
          // this.oldStatus = this.advList.status;
          this.createPaginationItem(adv['data'].total);
        }
        this.error = false;
      }, (err: Error) => {
        this.loaderService.display(false);
        this.error = true;
      });
  }

  private createPaginationItem(totalAdv: number) {
    this.totalAdv = totalAdv;
    const maxPages: number = Math.ceil(totalAdv / this.params.per_page);
    const end = (this.params.current_page + 5) < maxPages ? this.params.current_page + 5 : maxPages;
    const start = (this.params.current_page - 5) > 1 ? this.params.current_page - 5 : 1;
    this.totalPages = maxPages;
    this.totalPaginationShow = range(end, start);
  }

  public paginateList(newPage: number) {
    if (this.params.current_page === newPage) { return false; }
    this.params.current_page = newPage;
    localStorage.setItem('agentFilters', JSON.stringify(this.params));
    this.getRedPktList();
  }

  public nextOrPreviousPage(deviation: number) {
    this.params.current_page = this.params.current_page + deviation;
    localStorage.setItem('agentFilters', JSON.stringify(this.params));
    this.getRedPktList();
  }

  public searchFilter(type?: string) {
    localStorage.setItem('agentFilters', JSON.stringify(this.params));
    if (type === 'reset') {
      this.params = { ...INITIAL_PARAMS };
      localStorage.removeItem('agentFilters');
    }
    this.params.current_page = 1;
    this.getRedPktList();
  }

  public startEdit(agent) {
    this.currentAgent = agent;

  }

  public onStatusEdit(editStatus: any) {
    if (editStatus.success) {
      this.advList[this.currentAgent.agentIndex].status = this.currentAgent.status;
      this.advList[this.currentAgent.agentIndex].balance = this.currentAgent.balance;
    }
  }

  public onStatusSubmit(adv) {

    this.loaderService.display(true);
    adv.isEditabel = false;
    if (this.oldStatus !== this.advList.status) {
      this.gameService.editRedPkt({ status: adv.status })
        .subscribe((res: any) => {
          this.loaderService.display(false);
          if (res && res.message) {
            this.getRedPktList();
            this.toastr.success(res.message || 'advertisment status updated successfully.');
          }

        }, (err: any) => {
          this.loaderService.display(false);
          if (err && err.error && err.error.message) {
            this.toastr.error(err.error.message || 'There was an error');
          }
        });
    } else {
      this.loaderService.display(false);
    }
  }
}
