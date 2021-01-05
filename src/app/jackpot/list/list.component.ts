import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';

import { range, dateFormatString, formatDateTimeZone } from '../../services/utils.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { LoaderService } from '../../shared/loader/loader.service';
import { Constants } from '../../constants';
import { SubscriptionService } from '../../services/subscription.service';
import { TranslateService } from '@ngx-translate/core';
import { JackpotService } from '../../services/jackpot.service';


const INITIAL_PARAMS = {
  per_page: 20,
  current_page: 1
};

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  public params = { ...INITIAL_PARAMS };
  public jackPotList = null;
  public totalJackpot = 0;
  public totalPaginationShow = [];
  public totalPages = 0;
  public enableEdit = false;
  public oldStatus = '';
  public adv_status = '';
  public advertisment_status = '';
  public currency_code = Constants.CURRENCY_CODE;
  public error = false;
  public currentAgent = null;
  public countryList = [];
  public dateFormatString = dateFormatString;
  public formatDateTimeZone = formatDateTimeZone;
  public currentAdv: any;
  public isEditabel = 0;
  public formSubmitted = false;
  public url = 'jackpot/list?';

  constructor(
    private jackpotService: JackpotService,
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
    this.getJackPotList();
  }

  private createUrl() {
    this.url = 'jackpot/list?';
    this.url += 'per_page=' + this.params.per_page + '&page=' + this.params.current_page;
  }

  goBack() {
    this.location.back();
  }

  public getJackPotList() {
    this.loaderService.display(true);
    this.createUrl();
    this.jackpotService.getJackpot(this.url)
      .subscribe((jpot: []) => {
        this.loaderService.display(false);
        if (jpot['data'] && jpot['data'].data) {
          this.jackPotList = jpot['data'].data;
          this.createPaginationItem(jpot['data'].total);
        }
        this.error = false;
      }, (err: Error) => {
        this.loaderService.display(false);
        this.error = true;
      });
  }

  private createPaginationItem(totaljp: number) {
    this.totalJackpot = totaljp;
    const maxPages: number = Math.ceil(totaljp / this.params.per_page);
    const end = (this.params.current_page + 5) < maxPages ? this.params.current_page + 5 : maxPages;
    const start = (this.params.current_page - 5) > 1 ? this.params.current_page - 5 : 1;
    this.totalPages = maxPages;
    this.totalPaginationShow = range(end, start);
  }

  public paginateList(newPage: number) {
    if (this.params.current_page === newPage) { return false; }
    this.params.current_page = newPage;
    this.getJackPotList();
  }

  public nextOrPreviousPage(deviation: number) {
    this.params.current_page = this.params.current_page + deviation;
    this.getJackPotList();
  }
  
  //edit and update jackpot details
  jackpotEditable(id: number) {
    this.isEditabel = id;
  }

  public updateJackpot(jackpot) {
    this.loaderService.display(true);
    this.isEditabel =  jackpot.id;
    const forminputdata = {
      id            : jackpot.id,
      jackpot_value : jackpot.jackpot_value,
      reset_value   : jackpot.reset_value
    };  
    this.jackpotService.update(forminputdata).pipe()
      .subscribe((result: any) => {
        this.formSubmitted = false;
        this.isEditabel = 0;
        this.toastr.success(result.message || 'Jackpot detail updated Sucessfully.');
        this.getJackPotList();
      }, err => {
        const errorMessage = '';
        this.isEditabel = 0;
        this.toastr.error(errorMessage || err.error.global_error || err.error.message || 'Some error occurred while updating jackpot.');
        this.formSubmitted = false;
      });
  }

}