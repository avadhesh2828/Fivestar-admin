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
  selector: 'app-game-history',
  templateUrl: './game-history.component.html',
  styleUrls: ['./game-history.component.scss']
})
export class GameHistoryComponent implements OnInit {
  public user = null;
  public error = false;
  public scorLogForm: FormGroup;
  public formSubmitted = false;
  public formError: any;
  public submitted = false;
  public showTable = false;

  public params = { ...INITIAL_PARAMS };
  public gameHistory = [];
  public totalGameHistory = 0;
  public totalPaginationShow = [];
  public totalPages = 0;
  public jump_to : any;
  public checkLastPage :any;
  public recallUrl : any = '';
  public transactionId :any = '';

  public formatDateTimeZone = formatDateTimeZone;
  public maxDate = new Date();
  public url = 'finance/game-history?';
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
      const userId = this.route.snapshot.queryParams.user_id;
      if(userId) {
        this.getUserDetail(userId);
      }

      this.scorLogForm = this.formBuilder.group({
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
    this.scorLogForm.setValue({userName: username,date: ''})
  }

  private createUrl() {
    this.url = 'finance/game-history?';
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
        this.showTable = true;
        if (log['data'] && log['data'].data) {
          this.gameHistory = log['data'].data;
          this.checkLastPage = log['data'].last_page;
          this.jump_to = this.checkLastPage;
          this.createPaginationItem(log['data'].total);
        } else {
          this.createPaginationItem(0);
          this.gameHistory = log['data'];
        }
        this.loaderService.display(false);
        this.error = false;
      }, (err: Error) => {
        this.loaderService.display(false);
        this.error = true;
      });
    }
  }

  private createPaginationItem(totalGame: number) {
    this.totalGameHistory = totalGame;
    const maxPages: number = Math.ceil(totalGame / this.params.per_page);
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
    console.log('current_page', this.params.current_page)
    console.log('deviation', deviation)
    this.onSubmit();
  }

  handleReset() {
    this.showTable = false; 
    this.gameHistory = [];
    this.scorLogForm.reset();
  }


  gameLogModel(game) {
    this.gameLog = game;
    this.game_recall(game);
    $('#gameLogModel').modal('show');
  }

  goBack() {
    this.location.back();
  }

  // jump page
  public jumpAnotherPage(checkLastPage) {
      if(checkLastPage >= this.jump_to) {
        this.params.current_page = this.jump_to;
        this.onSubmit();
      } 
  }

  public game_recall(game){
    this.loaderService.display(true);
    this.transactionService.gameRecall({transactionId : game.transaction_id, game_id : game.game_id, round : game.round}, game.game_detail.provider_id)
      .subscribe((dat) => {
        this.loaderService.display(false);
        this.recallUrl = dat['data'];
        $('#game-container').find('iframe').attr('src',this.recallUrl);
      }, (err: object) => {
        this.loaderService.display(false);
        this.error = true;
      });
  }

}