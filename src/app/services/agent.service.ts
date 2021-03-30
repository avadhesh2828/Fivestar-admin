import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AgentService {
  constructor(private http: HttpClient) { }

  // getAgents(params: object) {
  //   return this.http.post(`${environment.API_URL}/agents`, params);
  // }

  getAgents(url:any) {
    return this.http.get(`${environment.API_URL}/${url}`);
  }

  changeAgentStatus(agentId: any, data: object){
    return this.http.post(`${environment.API_URL}/agent/change-agent-status/${agentId}`, data);
  }


  getAgentDetails(agentId: any) {
    return this.http.get(`${environment.API_URL}/agent/get-agent-details/${agentId}`);
  }

  setAgentScore(data: object) {
    return this.http.post(`${environment.API_URL}/agent/set-score`, data);
  }

  updateAgent(params: object) {
    return this.http.post(`${environment.API_URL}/agent/update-agent`,params);
  }

  getAgentTicketDetails(params: object) {
    return this.http.post(`${environment.API_URL}/agent/get_agent_ticket_detail`, params);
  }


  // changeAgentStatus(params: object) {
  //   return this.http.post(`${environment.API_URL}/agent/change_agent_status`, params);
  // }

  //change password
  changePassword(params: object) {
    return this.http.post(`${environment.API_URL}/change-password`, params);
  }

  //change security password
  changeSecurityPassword(params: object) {
    return this.http.post(`${environment.API_URL}/change-security-password`, params);
  }

  getCountryList() {
    return this.http.post(`${environment.API_URL}/common/country_list`, {});
  }

  getStateList(params: any) {
    return this.http.post(`${environment.API_URL}/common/state_list`, params);
  }

  editAgentUsername(params: any) {
    return this.http.post(`${environment.API_URL}/agent/change_agent_user_name`, params);
  }
  // agent
  createAgent(params: object) {
    return this.http.post(`${environment.API_URL}/agent/create`, params);
  }

  // change kyc status
  editAgentKycStatus(params: any) {
    return this.http.post(`${environment.API_URL}/agent/change_agent_kyc_status`, params);
  }
  editAgentCommissionType(params: any) {
    return this.http.post(`${environment.API_URL}/agent/change_agent_commission_type`, params);
  }
  editAgentCommissionAmount(params: any) {
    return this.http.post(`${environment.API_URL}/agent/change_agent_commission_amount`, params);
  }

  // agent payout list

  getAgentPayout(params: object) {
    return this.http.post(`${environment.API_URL}/agent/agent_payout_list`, params);
  }

  // edit payout status

  editPayoutStatus(params: any) {
    return this.http.post(`${environment.API_URL}/agent/change_payout_status`, params);
  }

  reports(url: any, params: any) {
    return this.http.post(`${environment.API_URL}/${url}`, params);
  }

  allAgentReport(url: any, params: any) {
    return this.http.post(`${environment.API_URL}/${url}`, params);
  }

}
