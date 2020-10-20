import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { AgentService } from '../../services/agent.service';
import { range, dateFormatString, formatDateTimeZone } from '../../services/utils.service';
import { AGENT_STATUS, KYC_STATUS } from '../constants';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { LoaderService } from '../../shared/loader/loader.service';
import { Constants } from '../../constants';

const INITIAL_PARAMS = {
  items_perpage: 20,
  current_page: 1,
  sort_field: 'name',
  sort_order: 'ASC',
  country: -1,
  keyword: '',
  status: -1,
  is_agent:1
};
@Component({
  selector: 'app-agent-list',
  templateUrl: './agent-list.component.html',
  styleUrls: ['./agent-list.component.scss', '../../shared/scss/shared.scss']
})
export class AgentListComponent implements OnInit, AfterViewInit {
  public params = {...INITIAL_PARAMS}
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
  searchTextChanged: Subject<string> = new Subject<string>();

  constructor(
    private agentService: AgentService,
    private toastr: ToastrService,
    private loaderService: LoaderService
  ) { }

  ngOnInit() {
    this.params = localStorage.getItem('agentFilters')
    ? JSON.parse(localStorage.getItem('agentFilters'))
    : { ...INITIAL_PARAMS };
    localStorage.removeItem('agentFilters');
    this.getCountryList();
    this.searchTextChanged.pipe(debounceTime(1000))
      .subscribe(model => this.getAgentList());
  }

  search() {
    this.params.current_page = 1;
    this.searchTextChanged.next();
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

  public getAgentList() {
    this.loaderService.display(true);
    this.agentService.getAgents(this.params)
      .subscribe((agent: []) => {
        console.log('0 ==>', agent);
        this.loaderService.display(false);
        if (agent['data'] && agent['data'].result) {
          this.agentList = agent['data'].result;
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
    const maxPages: number = Math.ceil(totalAgent / this.params.items_perpage);
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
}
