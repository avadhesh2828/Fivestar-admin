import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { AdvertisementService } from '../../services/advertisement.service';
import { range, dateFormatString, formatDateTimeZone } from '../../services/utils.service';
import { ADVERTISMENT_STATUS } from '../constants';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { LoaderService } from '../../shared/loader/loader.service';
import { Constants } from '../../constants';

const INITIAL_PARAMS = {
  per_page: 20,
  current_page: 1,
  sort_field: 'name',
  sort_order: 'ASC',
  country: -1,
  keyword: '',
  status: -1,
};
@Component({
  selector: 'app-adv-list',
  templateUrl: './adv-list.component.html',
  styleUrls: ['./adv-list.component.scss', '../../shared/scss/shared.scss']
})
export class AdvListComponent implements OnInit, AfterViewInit {
  public params = {...INITIAL_PARAMS}
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
  public confirmbMessage = '';
  public url: string = 'advertisements/get_advertisement?';

  searchTextChanged: Subject<string> = new Subject<string>();

  constructor(
    private advService: AdvertisementService,
    private toastr: ToastrService,
    private loaderService: LoaderService
  ) { }

  ngOnInit() {
    this.params = localStorage.getItem('agentFilters')
    ? JSON.parse(localStorage.getItem('agentFilters'))
    : { ...INITIAL_PARAMS };
    localStorage.removeItem('agentFilters');
    this.getAdvList();
    this.searchTextChanged.pipe(debounceTime(1000))
      .subscribe(model => this.getAdvList());
  }

  search() {
    this.params.current_page = 1;
    this.searchTextChanged.next();
  }

  private createUrl() {
    this.url = 'advertisements/get_advertisement?';
    this.url += 'per_page=' + this.params.per_page + '&page=' + this.params.current_page + '&status=' + this.params.status + '&keyword=' + this.params.keyword;
  }

  ngAfterViewInit() {
    const that = this;
    // Listen for bootstrap modal's hidden event to reset form
    $('#editModal').on('hidden.bs.modal', function () {
      that.currentAgent = null;
      $(this).find('textarea').val('').end();
    });
  }

  public getAdvList() {
    this.loaderService.display(true);
    this.createUrl();
    this.advService.getAllAdvertisment(this.url)
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
    this.getAdvList();
  }

  public nextOrPreviousPage(deviation: number) {
    this.params.current_page = this.params.current_page + deviation;
    localStorage.setItem('agentFilters', JSON.stringify(this.params));
    this.getAdvList();
  }

  public searchFilter(type?: string) {
    localStorage.setItem('agentFilters', JSON.stringify(this.params));
    if (type === 'reset') {
      this.params = { ...INITIAL_PARAMS };
      localStorage.removeItem('agentFilters');
    }
    this.params.current_page = 1;
    this.getAdvList();
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

  public onStatusSubmit(adv)
  {
   
      this.loaderService.display(true);
       adv.isEditabel = false;
      // if (this.oldStatus !== this.advList.status) {
         this.advService.editAdvStatus({ ads_unique_id: adv.ads_unique_id, status: adv.status,ads_position_id: adv.ads_position_id })
           .subscribe((res: any) => {
          this.loaderService.display(false);
          if (res && res.message) {
            this.getAdvList();
            this.toastr.success(res.message || 'advertisment status updated successfully.');
          }

        }, (err: any) => {
          this.loaderService.display(false);
          if (err && err.error && err.error.message) {
            this.toastr.error(err.error.message || 'There was an error');
          }
        });
      // }
    //   else {
    //   this.loaderService.display(false);
    // }
    
  }
  deleteAdvertisementconfirm(adv) {
    this.currentAdv = adv;
    this.confirmbMessage = 'Are you sure you want to Delete "' + adv.ad_name +'" ?';
    $('#deleteAdvertisementconfirm').modal('show');
  }
  deleteAdv(){
    this.advService.deleteAdvertisment({'ads_unique_id':this.currentAdv.ads_unique_id})
      .subscribe((res: any) => {
        this.loaderService.display(false);
        if (res) {
          this.toastr.success(res.message || 'advertisment Deleted successfully.');
          this.getAdvList();
        }
        this.error = false;
      }, (err: any) => {
          this.loaderService.display(false);
          if (err && err.error && err.error.message) {
            this.toastr.error(err.error.message || 'There was an error');
          }
      });
  }
}
