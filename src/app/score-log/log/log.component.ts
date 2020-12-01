import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { formatDateTime, formatDate, formatDateTimeZone, range } from '../../services/utils.service';
import { TransactionService } from 'src/app/services/transaction.service';
import { LoaderService } from '../../shared/loader/loader.service';
import { ActivatedRoute } from '@angular/router';

import { SubscriptionService } from '../../services/subscription.service';
import { TranslateService } from '@ngx-translate/core';


const INITIAL_PARAMS = {
  per_page: 10,
  current_page: 1,
};

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.scss']
})
export class LogComponent implements OnInit {
  public user = null;
  public error = false;
  maxBalance : any;
  

  public scorLogForm: FormGroup;
  formSubmitted = false;
  formError: any;
  submitted = false;
  showLoginIPList = false;

  public params = { ...INITIAL_PARAMS };
  public scoreLogList = [];
  public totalScoreLog = 0;
  public totalPaginationShow = [];
  public totalPages = 0;

  public formatDateTimeZone = formatDateTimeZone;
  public maxDate = new Date();
  public url = 'finance/score-log?'

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private transactionService : TransactionService,
    public subscriptionService: SubscriptionService,
    public translate: TranslateService,

    private route: ActivatedRoute, 
    private loaderService: LoaderService,
  ) { 
    this.subscriptionService.language.subscribe((lang) => {
      this.translate.setDefaultLang(lang);  // this will happen on every change
    });
  }

  ngOnInit() {
      this.scorLogForm = this.formBuilder.group({
        'userName': ['', [Validators.required]],
        'date': ['', [Validators.required]]
      });
  }

  
  private createUrl() {
    this.url = 'finance/score-log?';
    this.url += 'per_page=' + this.params.per_page + '&page=' + this.params.current_page;;
  }

  get f() {
    return this.scorLogForm.controls;
  }
  
  onSubmit() {
    const date = this.f.date.value.length == 2 ? {
      fromdate: `${formatDate( this.f.date.value[0])} 00:00:00`,
      todate: `${formatDate( this.f.date.value[1])} 23:59:59`,
      time_zone:  this.f.date.value[0].toString().split(' ')[5],
    } : [];
    
    this.submitted = true;
    this.createUrl();
    if (this.scorLogForm.invalid || this.formError) {
      return;
    } else {
      const forminputdata = {
        'username': this.f.userName.value,
        'dates'   : date,
      };
      this.formSubmitted = true;
      this.loaderService.display(true);
      this.transactionService.playerScoreLog(this.url, forminputdata)
      .subscribe((log: []) => {
        this.loaderService.display(false);
        if (log['data'] && log['data'].data) {
          this.scoreLogList = log['data'].data;
          this.createPaginationItem(log['data'].total);
        } else {
          this.scoreLogList = log['data'];
        }
        this.loaderService.display(false);
        this.error = false;
      }, (err: Error) => {
        this.loaderService.display(false);
        this.error = true;
      });
    }

    // this.loaderService.display(true);
    // this.createUrl();
    
  }

  private createPaginationItem(totalScore: number) {
    this.totalScoreLog = totalScore;
    const maxPages: number = Math.ceil(totalScore / this.params.per_page);
    const end = (this.params.current_page + 5) < maxPages ? this.params.current_page + 5 : maxPages;
    const start = (this.params.current_page - 5) > 1 ? this.params.current_page - 5 : 1;
    this.totalPages = maxPages;
    this.totalPaginationShow = range(end, start);
  }

  public paginateList(newPage: number) {
    if (this.params.current_page === newPage) { return false; }
    this.params.current_page = newPage;
    this.onSubmit();
  }

  public nextOrPreviousPage(deviation: number) {
    this.params.current_page = this.params.current_page + deviation;
    this.onSubmit();
  }

  handleReset() {
    this.showLoginIPList = false;
    this.scorLogForm.reset();
  }

}