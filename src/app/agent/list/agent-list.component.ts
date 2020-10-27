import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

import { AgentService } from '../../services/agent.service';
import { range, dateFormatString, formatDateTimeZone } from '../../services/utils.service';
import { SubscriptionService } from '../../services/subscription.service';
import { AGENT_STATUS, KYC_STATUS } from '../constants';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { LoaderService } from '../../shared/loader/loader.service';
import { Constants } from '../../constants';

const INITIAL_PARAMS = {
  per_page: 10,
  current_page: 1,
  parent_id: '',
};
@Component({
  selector: 'app-agent-list',
  templateUrl: './agent-list.component.html',
  styleUrls: ['./agent-list.component.scss', '../../shared/scss/shared.scss']
})
export class AgentListComponent implements OnInit, AfterViewInit {
  public params = { ...INITIAL_PARAMS };
  public agentList = null;
  public totalAgents = 0;
  public totalPaginationShow = [];
  public totalPages = 0;
  public AgentStatus = AGENT_STATUS;
  public currency_code = Constants.CURRENCY_CODE;
  public kycStatus = KYC_STATUS;
  public error = false;
  public currentAgent = null;
  public countryList = [];
  public dateFormatString = dateFormatString;
  public formatDateTimeZone = formatDateTimeZone;
  public url = 'agent/list?';
  formSubmitted = false;
  selectedAgent: any = '';
  searchTextChanged: Subject<string> = new Subject<string>();

  constructor(
    private agentService: AgentService,
    private toastr: ToastrService,
    private loaderService: LoaderService,
    private location: Location,
    public translate: TranslateService,
    public subscriptionService: SubscriptionService
  ) {
    this.subscriptionService.language.subscribe((lang) => {
      this.translate.setDefaultLang(lang);  // this will happen on every change
    });
  }

  ngOnInit() {
    // this.params = localStorage.getItem('agentFilters')
    // ? JSON.parse(localStorage.getItem('agentFilters'))
    // : { ...INITIAL_PARAMS };
    // localStorage.removeItem('agentFilters');
    // this.getCountryList();
    // this.searchTextChanged.pipe(debounceTime(1000))
    //   .subscribe(model => this.getAgentList());

    this.getAgentList();
  }

  search() {
    this.params.current_page = 1;
    this.searchTextChanged.next();
  }

  goBack() {
    this.location.back();
  }

  ngAfterViewInit() {
    const that = this;
    // Listen for bootstrap modal's hidden event to reset form
    $('#editModal').on('hidden.bs.modal', function () {
      that.currentAgent = null;
      $(this).find('textarea').val('').end();
    });
  }

  public getCountryList() {
    this.agentService.getCountryList()
      .subscribe((response: any) => {
        this.countryList = response.result;
        this.getAgentList();
      }, (err: Error) => {
        this.toastr.error(err.message || 'There was an error.');
        this.error = true;
      });
  }

  private createUrl() {
    this.url = 'agent/list?';
    this.url += 'per_page=' + this.params.per_page + '&page=' + this.params.current_page + '&parent_id=' + this.selectedAgent;
  }

  public getAgentList() {
    this.loaderService.display(true);
    this.createUrl();
    this.agentService.getAgents(this.url)
      .subscribe((agent: []) => {
        this.loaderService.display(false);
        if (agent['data'] && agent['data'].data) {
          this.agentList = agent['data'].data;
          this.createPaginationItem(agent['data'].total);
        }
        this.error = false;
      }, (err: Error) => {
        this.loaderService.display(false);
        this.error = true;
      });
  }

  private createPaginationItem(totalAgent: number) {
    this.totalAgents = totalAgent;
    const maxPages: number = Math.ceil(totalAgent / this.params.per_page);
    const end = (this.params.current_page + 5) < maxPages ? this.params.current_page + 5 : maxPages;
    const start = (this.params.current_page - 5) > 1 ? this.params.current_page - 5 : 1;
    this.totalPages = maxPages;
    this.totalPaginationShow = range(end, start);
  }

  public paginateList(newPage: number) {
    if (this.params.current_page === newPage) { return false; }
    this.params.current_page = newPage;
    localStorage.setItem('agentFilters', JSON.stringify(this.params));
    this.getAgentList();
  }

  public nextOrPreviousPage(deviation: number) {
    this.params.current_page = this.params.current_page + deviation;
    localStorage.setItem('agentFilters', JSON.stringify(this.params));
    this.getAgentList();
  }

  public searchFilter(type?: string) {
    localStorage.setItem('agentFilters', JSON.stringify(this.params));
    if (type === 'reset') {
      this.params = { ...INITIAL_PARAMS };
      localStorage.removeItem('agentFilters');
    }
    this.params.current_page = 1;
    this.getAgentList();
  }

  public startEdit(agent) {
    this.currentAgent = agent;

  }

  public onStatusEdit(editStatus: any) {
    if (editStatus.success) {
      this.agentList[this.currentAgent.agentIndex].status = this.currentAgent.status;
      this.agentList[this.currentAgent.agentIndex].balance = this.currentAgent.balance;
      this.getAgentList();
    }
  }


  public checkSubAgent(agent: any) {
    this.selectedAgent = agent.admin_id;
    // localStorage.setItem('agentId', JSON.stringify(this.selectedAgent));
    this.getAgentList();
  }

  public changeAgentStatus(agentId: any, status: any) {
    this.formSubmitted = true;
    const forminputdata = {
      status: status
    };
    this.agentService.changeAgentStatus(agentId, forminputdata).pipe()
      .subscribe((res: any) => {
        this.formSubmitted = false;
        this.toastr.success(res.message || 'Agent status changed Sucessfully.');
        this.getAgentList();
      }, err => {
        const errorMessage = '';
        this.toastr.error(errorMessage || err.error.global_error || err.error.message || 'Some error occurred while change agent status.');
        this.formSubmitted = false;
      });

  }

}
