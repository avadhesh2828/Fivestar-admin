import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { AgentService } from '../../services/agent.service';
import { range, dateFormatString, formatDateTimeZone } from '../../services/utils.service';
import { AGENT_STATUS, KYC_STATUS ,COMMISIION_STATUS} from '../constants';
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
};
@Component({
  selector: 'app-agent-payout',
  templateUrl: './agent-payout.component.html',
  styleUrls: ['./agent-payout.component.scss', '../../shared/scss/shared.scss']
})
export class AgentPayoutComponent implements OnInit, AfterViewInit {
  public params = {...INITIAL_PARAMS}
  public agentPyoutList = null;
  public totalPayoutAgents = 0;
  public totalPaginationShow = [];
  public totalPages = 0;
  public AgentStatus = AGENT_STATUS;
  public CommissionStatus = COMMISIION_STATUS
  public currency_code = Constants.CURRENCY_CODE;
  public kycStatus = KYC_STATUS;
  public error = false;
  public currentAgent = null;
  public dateFormatString = dateFormatString;
  public formatDateTimeZone = formatDateTimeZone;
  searchTextChanged: Subject<string> = new Subject<string>();

  constructor(
    private agentService: AgentService,
    private toastr: ToastrService,
    private loaderService: LoaderService
  ) { }

  ngOnInit() {
    this.params = localStorage.getItem('agentPayoutFilters')
    ? JSON.parse(localStorage.getItem('agentPayoutFilters'))
    : { ...INITIAL_PARAMS };
    localStorage.removeItem('agentPayoutFilters');
    this.getAgentPayoutList();
    this.searchTextChanged.pipe(debounceTime(1000))
      .subscribe(model => this.getAgentPayoutList());
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


  public getAgentPayoutList() {
    this.loaderService.display(true);
    this.agentService.getAgentPayout(this.params)
      .subscribe((agent_payout: []) => {
        this.loaderService.display(false);
        if (agent_payout['data'] && agent_payout['data'].result) {
          this.agentPyoutList = agent_payout['data'].result;
          this.createPaginationItem(agent_payout['data'].total);
        }
        this.error = false;
      }, (err: Error) => {
        this.loaderService.display(false);
        this.error = true;
      });
  }

  private createPaginationItem(totalPayoutAgents: number) {
    this.totalPayoutAgents = totalPayoutAgents;
    const maxPages: number = Math.ceil(totalPayoutAgents / this.params.items_perpage);
    const end = (this.params.current_page + 5) < maxPages ? this.params.current_page + 5 : maxPages;
    const start = (this.params.current_page - 5) > 1 ? this.params.current_page - 5 : 1;
    this.totalPages = maxPages;
    this.totalPaginationShow = range(end, start);
  }

  public paginateList(newPage: number) {
    if (this.params.current_page === newPage) { return false; }
    this.params.current_page = newPage;
    localStorage.setItem('agentPayoutFilters', JSON.stringify(this.params));
    this.getAgentPayoutList();
  }

  public nextOrPreviousPage(deviation: number) {
    this.params.current_page = this.params.current_page + deviation;
    localStorage.setItem('agentPayoutFilters', JSON.stringify(this.params));
    this.getAgentPayoutList();
  }

  public searchFilter(type?: string) {
    localStorage.setItem('agentPayoutFilters', JSON.stringify(this.params));
    if (type === 'reset') {
      this.params = { ...INITIAL_PARAMS };
      localStorage.removeItem('agentPayoutFilters');
    }
    this.params.current_page = 1;
    this.getAgentPayoutList();
  }

  public startEdit(agent) {
    this.currentAgent = agent;

  }

  public onStatusSubmit(payoutdetail)
  {
   
      this.loaderService.display(true);
       payoutdetail.isEditabel = false;
         this.agentService.editPayoutStatus({agent_commission_payout_id:payoutdetail.agent_commission_payout_id,agent_id: payoutdetail.agent_id, status: payoutdetail.status})
           .subscribe((res: any) => {
          this.loaderService.display(false);
          if (res && res.message) {
            this.getAgentPayoutList();
            this.toastr.success(res.message || 'Payout status updated successfully.');
            
          }

        }, (err: any) => {
          this.loaderService.display(false);
          if (err && err.error && err.error.message) {
            this.toastr.error(err.error.message || 'There was an error');
          }
        });
    
  }
}
