import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AgentService {
  constructor(private http: HttpClient) { }

  getAgents(params: object) {
    return this.http.post(`${environment.API_URL}/agents`, params);
  }

  getAgentDetails(agentId: string) {
    return this.http.post(`${environment.API_URL}/agent/get_agent_detail`, { agent_unique_id: agentId });
  }

   getAgentTicketDetails(params: object) {
    return this.http.post(`${environment.API_URL}/agent/get_agent_ticket_detail`,params);
  }


  changeAgentStatus(params: object) {
    return this.http.post(`${environment.API_URL}/agent/change_agent_status`, params);
  }

  getCountryList() {
    return this.http.post(`${environment.API_URL}/common/country_list`, {});
  }

  getStateList(params: any){
      return this.http.post(`${environment.API_URL}/common/state_list`, params);
  }

  editAgentUsername(params: any) {
    return this.http.post(`${environment.API_URL}/agent/change_agent_user_name`, params);
  }
  //agent
  createAgent(params: object) {
    return this.http.post(`${environment.API_URL}/agent/new_agent`, params);
  }

  //change kyc status
  editAgentKycStatus(params:any)
  {
    return this.http.post(`${environment.API_URL}/agent/change_agent_kyc_status`, params);
  }
  editAgentCommissionType(params:any)
  {
    return this.http.post(`${environment.API_URL}/agent/change_agent_commission_type`, params); 
  }
  editAgentCommissionAmount(params:any)
  {
    return this.http.post(`${environment.API_URL}/agent/change_agent_commission_amount`, params); 
  }

  //agent payout list 

  getAgentPayout(params: object) {
    return this.http.post(`${environment.API_URL}/agent/agent_payout_list`, params);
  }
  
  //edit payout status

  editPayoutStatus(params:any)
  {
     return this.http.post(`${environment.API_URL}/agent/change_payout_status`, params);
  }

}
