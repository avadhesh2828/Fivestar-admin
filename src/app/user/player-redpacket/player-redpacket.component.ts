import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { formatDateTime, formatDate, formatDateTimeZone, range } from '../../services/utils.service';
import { TransactionService } from 'src/app/services/transaction.service';
import { UserService } from '../../services/user.service';
import { LoaderService } from '../../shared/loader/loader.service';
import { ActivatedRoute } from '@angular/router';
import { SubscriptionService } from '../../services/subscription.service';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';


const INITIAL_PARAMS = {
  per_page: 10,
  current_page: 1,
};


@Component({
  selector: 'app-player-redpacket',
  templateUrl: './player-redpacket.component.html',
  styleUrls: ['./player-redpacket.component.scss']
})
export class PlayerRedpacketComponent implements OnInit {

  public user = null;
  public error = false;
  public logForm: FormGroup;
  public formSubmitted = false;
  public formError: any;
  public submitted = false;
  public showTable = false;

  public params = { ...INITIAL_PARAMS };
  public redpacketLog = [];

  public formatDateTimeZone = formatDateTimeZone;
  public maxDate = new Date();
  public url = 'finance/player-redpacket?';
  public gameLog = '';

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private transactionService : TransactionService,
    private userService : UserService,
    public subscriptionService: SubscriptionService,
    public translate: TranslateService,
    private route: ActivatedRoute, 
    private loaderService: LoaderService,
    private location: Location,
  ) { 
    this.subscriptionService.language.subscribe((lang) => {
      this.translate.setDefaultLang(lang);  // this will happen on every change
    });
  }

  ngOnInit() {
    // const userId = this.route.snapshot.queryParams.user_id;
    const userId = this.route.snapshot.paramMap.get('userId');
      if(userId) {
        this.getUserDetail(userId);
      }

      this.logForm = this.formBuilder.group({
        'userName': ['', [Validators.required]],
        'date': ['', [Validators.required]]
      });
  }

  private getUserDetail(userId) {
    this.loaderService.display(true);
    this.userService.getUserDetails(userId)
      .subscribe((user) => {
        this.loaderService.display(false);
        if (user['data']) {
          this.user = user['data'];
          this.setValue(this.user.username);
        }
      }, (err: object) => {
        this.loaderService.display(false);
        this.error = true;
      });
  }

  setValue(username){
    this.logForm.setValue({userName: username,date: ''})
  }

  private createUrl() {
    this.url = 'finance/player-redpacket?';
    this.url += 'per_page=' + this.params.per_page + '&page=' + this.params.current_page;;
  }

  get f() {
    return this.logForm.controls;
  }
  
  onSubmit() {
    const date = this.f.date.value.length == 2 ? {
      fromdate: `${formatDate( this.f.date.value[0])} 00:00:00`,
      todate: `${formatDate( this.f.date.value[1])} 23:59:59`,
      time_zone:  this.f.date.value[0].toString().split(' ')[5],
    } : [];
    
    this.submitted = true;
    this.createUrl();
    if (this.logForm.invalid || this.formError) {
      return;
    } else {
      const forminputdata = {
        'username': this.f.userName.value,
        'dates'   : date,
      };
      this.formSubmitted = true;
      this.loaderService.display(true);
      this.transactionService.playerRedpacketLog(this.url, forminputdata)
      .subscribe((log: []) => {
        this.loaderService.display(false);
        this.showTable = true;
        if (log['data'] && log['data'].data) {
          this.redpacketLog = log['data'].data;
        } else {
          this.redpacketLog = log['data'];
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
    this.redpacketLog = [];
    this.logForm.reset();
  }

  goBack() {
    this.location.back();
  }

}