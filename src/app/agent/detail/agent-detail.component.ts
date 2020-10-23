import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';

import { AgentService } from '../../services/agent.service';
import { UserService } from '../../services/user.service';
import { range, dateFormatString, formatDateTimeZone } from '../../services/utils.service';
import { AGENT_STATUS, KYC_STATUS } from '../constants';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { LoaderService } from '../../shared/loader/loader.service';
import { Constants } from '../../constants';
import { ActivatedRoute } from '@angular/router';

const INITIAL_PARAMS = {
  per_page: 10,
  current_page: 1,
  parent_id: '',
};

// const INITIAL_PARAMS_USER = {
//   per_page: 10,
//   current_page: 1,
//   status: 1,
// };

@Component({
  selector: 'app-agent-detail',
  templateUrl: './agent-detail.component.html',
  styleUrls: ['./agent-detail.component.scss']
})

export class AgentDetailComponent implements OnInit {
  public params = { ...INITIAL_PARAMS };
  public agentList = null;
  public userList  = [];
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
  public urlUser = 'users/list?';
  formSubmitted = false;
  selectedAgent: any = '';
  selectedUser: any = 1;

  // public totalUsers = 0;
  // public totalPaginationShowUser = [];
  // public totalPagesUser = 0;

  constructor(
    private agentService: AgentService,
    private userService: UserService,
    private toastr: ToastrService,
    private loaderService: LoaderService,
    private location: Location,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.selectedAgent = this.route.snapshot.paramMap.get('agentId');
    this.getAgentList();
    this.getUserList();
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



  private createUserUrl() {
    this.urlUser = 'users/list?';
    this.urlUser += 'per_page=' + this.params.per_page + '&page=' + this.params.current_page + '&status=' + this.selectedUser + '&parent_id=' + this.selectedAgent;
  }

  public getUserList() {
    this.loaderService.display(true);
    this.createUserUrl();
    this.userService.getAgents(this.urlUser)
      .subscribe((user: []) => {
        this.loaderService.display(false);
        if (user['data'] && user['data']) {
          this.userList = user['data'].data;
          // this.createPaginationItemUser(user['data'].total);
        }
        this.error = false;
      }, (err: Error) => {
        this.loaderService.display(false);
        this.error = true;
      });
  }

  // private createPaginationItemUser(totalUSer: number) {
  //   this.totalUsers = totalUSer;
  //   const maxPages: number = Math.ceil(totalUSer / this.params.per_page);
  //   const end = (this.params.current_page + 5) < maxPages ? this.params.current_page + 5 : maxPages;
  //   const start = (this.params.current_page - 5) > 1 ? this.params.current_page - 5 : 1;
  //   this.totalPagesUser = maxPages;
  //   this.totalPaginationShowUser = range(end, start);
  // }

  // public paginateListUser(newPage: number) {
  //   if (this.params.current_page === newPage) { return false; }
  //   this.params.current_page = newPage;
  //   // localStorage.setItem('adminuserFilters', JSON.stringify(this.params));
  //   this.getUserList();
  // }

  // public nextOrPreviousPageUser(deviation: number) {
  //   this.params.current_page = this.params.current_page + deviation;
  //   localStorage.setItem('adminuserFilters', JSON.stringify(this.params));
  //   this.getUserList();
  // }

  public agentPlayer(agent: any) {
    this.selectedAgent = agent.admin_id;
    this.getUserList();
  }

  public changeUserStatus(agentId: any, status: any) {
    this.formSubmitted = true;
    const forminputdata = {
      status : status
    };    
    this.userService.changeUserStatus(agentId, forminputdata).pipe()
      .subscribe((res: any) => {
        this.formSubmitted = false;
        this.toastr.success(res.message || 'Player status changed Sucessfully.');
        this.getUserList();
      }, err => {
        const errorMessage = '';
        this.toastr.error(errorMessage || err.error.global_error || err.error.message || 'Some error occurred while change agent status.');
        this.formSubmitted = false;
      });

  }


}