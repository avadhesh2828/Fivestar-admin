import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { range ,formatDateTimeZone, dateFormatString } from '../../services/utils.service';
import { AgentService } from '../../services/agent.service';
import { AGENT_STATUS, KYC_STATUS } from '../constants';
import { LoaderService } from '../../shared/loader/loader.service';

const INITIAL_PARAMS = {
  items_perpage: 20,
  current_page: 1,
  sort_field: 'name',
  sort_order: 'ASC',
  country: -1,
  keyword: '',
  status: -1,
  is_agent:1,
  agent_unique_id:'',
};

@Component({
  selector: 'app-agent-ticket-info',
  templateUrl: './agent-ticket-info.component.html',
  styleUrls: ['./agent-ticket-info.component.scss']
})
export class AgentTicketInfoComponent implements OnInit {
  public params = localStorage.getItem('agentFilters_detail')
    ? JSON.parse(localStorage.getItem('agentFilters_detail'))
    : { ...INITIAL_PARAMS }
  public agent = null;
  public error = false;
  public enableEdit = false;
  public agentname = '';
  public formatDateTimeZone = formatDateTimeZone;
  public dateFormatString = dateFormatString;
  public agentStatus = AGENT_STATUS;
  public oldagentName = '';
  public totalAgents = 0;
  public totalPaginationShow = [];
  public totalPages = 0;


  constructor(
    private agentService: AgentService, private route: ActivatedRoute, private toastr: ToastrService,
    private loaderService: LoaderService) { }

  ngOnInit() {
    localStorage.removeItem('agentFilters_detail');
    this.params = {...INITIAL_PARAMS};
    this.getagentDetail();
  }

  private getagentDetail() {
    this.loaderService.display(true);
   this.params.agent_unique_id= this.route.snapshot.paramMap.get('agentId');
    this.agentService.getAgentTicketDetails(this.params)
      .subscribe((agents) => {
        this.loaderService.display(false);
        if (agents['data'] && agents['data'].result) {
          this.agent = agents['data'].result;
          // this.generateArray(this.agent);
          this.createPaginationItem(agents['data'].total);
          /*this.oldagentName = this.agent['agent_name'];*/
        }
      }, (err: object) => {
        this.loaderService.display(false);
        this.error = true;
      });
  }

  parseUserInfo(user, field) {
    if (user) {
        let newUser;
        if(field === 'first_name'){
          newUser = JSON.parse(user)[field]+' '+ JSON.parse(user)['last_name'];
        }else{
          newUser = JSON.parse(user)[field];
        }
        if(newUser){
          return newUser;
        }else{
          return '-';
        }
    } else {
      return '-';
    }
  }



  // check it agentname is valid or not
  validagentname(event: any) {
    if ((event.key >= 'a' && event.key <= 'z') || (event.key >= 'A' && event.key <= 'Z')
      || (event.key >= '0' && event.key <= '9') || (event.key >= '_')) {
      return true;
    }
    return false;
  }

  public toggleEditagentname() {
    this.agentname = this.agent.agent_name || '';
    this.enableEdit = !this.enableEdit;
  }

  public formatDate(date) {
    if (date[date.length - 3] === '+') {
      return new Date(date + ':00');
    }
    return new Date(date);
  }

  public handleEdit() {
    if (!this.agentname.trim()) {
      this.toastr.error('agentname can not be empty!');
      return;
    }
    if (this.agentname.length < 3) {
      this.toastr.error('agentname must be at least 3 characters!');
      return;
    }
    this.loaderService.display(true);
    if (this.oldagentName !== this.agentname) {
      this.agentService.editAgentUsername({ agent_unique_id: this.agent.agent_unique_id, agentname: this.agentname })
        .subscribe((res: any) => {
          this.loaderService.display(false);
          this.agent.agent_name = this.agentname;
          this.oldagentName = this.agentname;
          this.enableEdit = false;
          if (res && res.message) {
            this.toastr.success(res.message || 'agentname updated successfully.');
          }

        }, (err: any) => {
          this.loaderService.display(false);
          if (err && err.error && err.error.message) {
            this.toastr.error(err.error.message || 'There was an error');
          }
          // this.agentname = this.agent.agent_name;
          // this.enableEdit = false;
        });
    } else {
      this.enableEdit = false;
      this.loaderService.display(false);
    }
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
    localStorage.setItem('agentFilters_detail', JSON.stringify(this.params));
    this.getagentDetail();
  }

  public nextOrPreviousPage(deviation: number) {
    this.params.current_page = this.params.current_page + deviation;
    localStorage.setItem('agentFilters_detail', JSON.stringify(this.params));
    this.getagentDetail();
  }

}
