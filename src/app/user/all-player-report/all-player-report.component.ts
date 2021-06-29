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
import { UserService } from '../../services/user.service';


@Component({
  selector: 'app-all-player-report',
  templateUrl: './all-player-report.component.html',
  styleUrls: ['./all-player-report.component.scss']
})
export class AllPlayerReportComponent implements OnInit {

  public error = false;
  public reportForm: FormGroup;
  public formSubmitted = false;
  public formError: any;
  public submitted = false;
  public showTable = false;
  public gameReport = [];
  
  public formatDateTimeZone = formatDateTimeZone;
  public maxDate = new Date();
  public url = 'finance/get-all-player-report?';

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private transactionService : TransactionService,
    public subscriptionService: SubscriptionService,
    public translate: TranslateService,
    private route: ActivatedRoute, 
    private loaderService: LoaderService,
    private userService: UserService,
  ) { 
    this.subscriptionService.language.subscribe((lang) => {
      this.translate.setDefaultLang(lang);  // this will happen on every change
    });
  }

  ngOnInit() {
      this.reportForm = this.formBuilder.group({
        'game_type': ['0', [Validators.required]],
        'date': ['', [Validators.required]]
      });
  }
  
  private createUrl() {
    this.url = 'finance/get-all-player-report?';
  }

  get f() {
    return this.reportForm.controls;
  }
  
  onSubmit() {
    const date = this.f.date.value.length == 2 ? {
      fromdate: `${formatDate( this.f.date.value[0])} 00:00:00`,
      todate: `${formatDate( this.f.date.value[1])} 23:59:59`,
      time_zone:  this.f.date.value[0].toString().split(' ')[5],
    } : [];
    
    this.submitted = true;
    this.createUrl();
    const userId = this.route.snapshot.paramMap.get('userId');
    if (this.reportForm.invalid || this.formError) {
      return;
    } else {
      const forminputdata = {
        'agent_id'    : userId,
        'game_type_id': this.f.game_type.value,
        'dates'       : date
      };
      this.formSubmitted = true;
      this.loaderService.display(true);
      this.transactionService.playerScoreLog(this.url, forminputdata)
      .subscribe((log: []) => {
        this.loaderService.display(false);
        this.showTable = true;
        if (log['data']) {
          this.gameReport = log;
        } else {
          this.gameReport = log['data'];
        }
        this.loaderService.display(false);
        this.error = false;
      }, (err: Error) => {
        this.loaderService.display(false);
        this.error = true;
      });
    }
  }

  handleReset() {
    this.showTable = false;
    this.gameReport = [];
    this.reportForm.reset();
  }


}