import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { formatDateTime, formatDate, formatDateTimeZone, range } from '../../services/utils.service';
import { AgentService } from 'src/app/services/agent.service';
import { LoaderService } from '../../shared/loader/loader.service';
import { ActivatedRoute } from '@angular/router';
import { SubscriptionService } from '../../services/subscription.service';
import { TranslateService } from '@ngx-translate/core';


const INITIAL_PARAMS = {
  per_page: 10,
  current_page: 1,
};

@Component({
  selector: 'app-all-report',
  templateUrl: './all-report.component.html',
  styleUrls: ['./all-report.component.scss']
})
export class AllReportComponent implements OnInit {

  public params = { ...INITIAL_PARAMS };
  public error = false;
  public reportForm: FormGroup;
  public formSubmitted = false;
  public formError: any;
  public submitted = false;
  public showTable = false;
  public gameReport = [];
  public totalGameReport = 0;
  public totalWin = 0;
  public totalPaginationShow = [];
  public totalPages = 0;
  public jump_to : any;
  public checkLastPage :any;
  public formatDateTimeZone = formatDateTimeZone;
  public maxDate = new Date();
  public url = 'finance/all-agent-report?';
  // private AgentWin = 0;
  // private AgentBet = 0;    
  // private value; 

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private agentService : AgentService,
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
    this.reportForm = this.formBuilder.group({
      'game_type': ['0', [Validators.required]],
      'date': ['', [Validators.required]]
    });
  }

  private createUrl() {
    this.url = 'finance/all-agent-report?';
    this.url += 'per_page=' + this.params.per_page + '&page=' + this.params.current_page;
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
    const agentId = this.route.snapshot.paramMap.get('agentId');
    if (this.reportForm.invalid || this.formError) {
      return;
    } else {
      const forminputdata = {
        'agent_id'    : agentId,
        'game_type_id': this.f.game_type.value,
        'dates'       : date
      };
      this.formSubmitted = true;
      this.loaderService.display(true);
      this.agentService.allAgentReport(this.url, forminputdata)
      .subscribe((log: []) => {
        this.loaderService.display(false);
        this.showTable = true;
        if (log['data'] && log['data'].data) {
          this.gameReport = log['data'].data;
          this.checkLastPage = log['data'].last_page;
          this.jump_to = this.checkLastPage;
          this.totalWin = log['data'].total_win;
          // this.findsum(this.gameReport);
          this.createPaginationItem(log['data'].total);
        } else {
          this.gameReport = log['data'];
          this.createPaginationItem(0);
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
    this.totalGameReport = totalGame;
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
    this.onSubmit();
  }

  handleReset() {
    this.showTable = false;
    this.gameReport = [];
    this.reportForm.reset();
  }

  // jump page
  public jumpAnotherPage(checkLastPage) {
    if(checkLastPage >= this.jump_to) {
      this.params.current_page = this.jump_to;
      this.onSubmit();
    } 
  }

  // findsum(data){     
  //   this.value=data    
  //   console.log(this.value);  
  //   for(let j=0;j<data.length;j++){   
  //        this.AgentBet+= this.value[j].bet;
  //        this.AgentWin+= this.value[j].win;      
  //   }  
  //   console.log('AgentBet' , this.AgentBet)
  //   console.log('AgentWin', this.AgentWin)
  // }

}