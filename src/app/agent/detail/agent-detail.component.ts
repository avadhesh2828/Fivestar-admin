import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { range ,formatDateTimeZone, dateFormatString } from '../../services/utils.service';
import { AgentService } from '../../services/agent.service';
import { AGENT_STATUS, KYC_STATUS,KYC_TYPE, COMMISSION_TYPE } from '../constants';
import { LoaderService } from '../../shared/loader/loader.service';
import { environment } from '../../../environments/environment';
import { Lightbox } from 'ngx-lightbox';
import { Constants } from '../../constants';

@Component({
  selector: 'app-agent-detail',
  templateUrl: './agent-detail.component.html',
  styleUrls: ['./agent-detail.component.scss']
})

export class AgentDetailComponent implements OnInit {
  public agent = null;
  public error = false;
  public enableEdit = false;
  public enableEditKyc = false;
  public enableEditCommisionType = false;
  public enableEditCommisionAmount = false;
  public agent_username = '';
  public agent_kyc_status = '';
  public agent_commission_type = '';
  public agent_commission_amount = '';
  public formatDateTimeZone = formatDateTimeZone;
  public dateFormatString = dateFormatString;
  public agentStatus = AGENT_STATUS;
  public currency_code = Constants.CURRENCY_CODE;
  public kycType = KYC_TYPE;
  public kycStatus = KYC_STATUS;
  public commissionType = COMMISSION_TYPE;
  public oldagentName = '';
  public oldkycStatus = '';
  public oldCommissionType = '';
  public oldCommissionAmount = '';
  public totalAgents = 0;
  public totalPaginationShow = [];
  public totalPages = 0;
  public AgentIdProofImage: any = null;
  private _albums = [];
  imgURL: any;

  constructor(
    private agentService: AgentService, private route: ActivatedRoute, private toastr: ToastrService,
    private loaderService: LoaderService,private _lightbox: Lightbox) { }

  ngOnInit() {
    this.getagentDetail();
  }

  private getagentDetail() {
    this.loaderService.display(true);
    const id = this.route.snapshot.paramMap.get('agentId');
    this.agentService.getAgentDetails(id)
      .subscribe((agents) => {
        this.loaderService.display(false);
         if (agents['data']) {
          this.imgURL = environment.IMG_URL;
          this.AgentIdProofImage = this.imgURL+'agent_proof/'+agents['data'].agent_proof_image;  
          this.agent = agents['data'];
          this.oldagentName = this.agent.agent_user_name;
          this.oldkycStatus = this.agent.kyc_status;
          this.oldCommissionType = this.agent.commission_type;
          this.oldCommissionAmount = this.agent.commission_amount;

          const src = this.AgentIdProofImage;
          const thumb = this.AgentIdProofImage;
          const album = {
             src: src,
             thumb: thumb
          };
          this._albums.push(album);
        }
      }, (err: object) => {
        this.loaderService.display(false);
        this.error = true;
      });
  }

  open(index: number): void {
    // open lightbox
    this._lightbox.open(this._albums, index);
  }
 
  close(): void {
    // close lightbox programmatically
    this._lightbox.close();
  }

  // check it username is valid or not
  validUsername(event: any) {
    if ((event.key >= 'a' && event.key <= 'z') || (event.key >= 'A' && event.key <= 'Z')
      || (event.key >= '0' && event.key <= '9') || (event.key >= '_')) {
      return true;
    }
    return false;
  }

  public toggleEditUsername() {
    this.agent_username = this.agent.agent_user_name || '';
    this.enableEdit = !this.enableEdit;
  }

  public toggleEditKycStatus()
  {
    this.agent_kyc_status = this.agent.kyc_status || '';
    this.enableEditKyc = !this.enableEditKyc;
  }

  public toggleEditCommissionType()
  {
    this.agent_commission_type = this.agent.commission_type || '';
    this.enableEditCommisionType = !this.enableEditCommisionType;
  }

  public toggleEditCommissionAmount()
  {
    this.agent_commission_amount = this.agent.commission_amount || '';
    this.enableEditCommisionAmount = !this.enableEditCommisionAmount;
  }

  public formatDate(date) {
    if (date[date.length - 3] === '+') {
      return new Date(date + ':00');
    }
    return new Date(date);
  }

  public handleEdit() {
    // debugger;
    if (!this.agent_username.trim()) {
      this.toastr.error('agent user name can not be empty!');
      return;
    }
    if (this.agent_username.length < 3) {
      this.toastr.error('agent user name must be at least 3 characters!');
      return;
    }
    this.loaderService.display(true);
    if (this.oldagentName !== this.agent_username) {
      this.agentService.editAgentUsername({ agent_unique_id: this.agent.agent_unique_id, agent_username: this.agent_username })
        .subscribe((res: any) => {
          this.loaderService.display(false);
          this.enableEdit = false;
          if (res && res.message) {
            this.toastr.success(res.message || 'agents username updated successfully.');
            this.agent.agent_user_name = this.agent_username;
            this.oldagentName = this.agent_username;
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

  public handleEditStatus()
  {
    this.loaderService.display(true);
    if (this.oldkycStatus !== this.agent.kyc_status) {
      this.agentService.editAgentKycStatus({ agent_unique_id: this.agent.agent_unique_id, kyc_status: this.agent.kyc_status })
      .subscribe((res: any) => {
          this.loaderService.display(false);
          
          this.enableEditKyc = false;
          if (res && res.message) {
            this.agent_kyc_status = this.agent.kyc_status;
            this.oldkycStatus = this.agent.kyc_status;
            this.toastr.success(res.message || 'agent kyc status updated successfully.');
            
          }

        }, (err: any) => {
          this.loaderService.display(false);
          if (err && err.error && err.error.message) {
            this.toastr.error(err.error.message || 'There was an error');
          }
        });
    }

    else {
      this.enableEditKyc = false;
      this.loaderService.display(false);
    }
  }

  public handleEditCommissionType()
  {
    this.loaderService.display(true);
    if (this.oldCommissionType !== this.agent.commission_type) {
      this.agentService.editAgentCommissionType({ agent_unique_id: this.agent.agent_unique_id, commission_type: this.agent.commission_type })
      .subscribe((res: any) => {
          this.loaderService.display(false);
          
          this.enableEditCommisionType = false;
          if (res && res.message) {
            this.agent_commission_type = this.agent.commission_type;
            this.oldCommissionType = this.agent.commission_type;
            this.toastr.success(res.message || 'agent commission type updated successfully.');
            
          }

        }, (err: any) => {
          this.loaderService.display(false);
          if (err && err.error && err.error.message) {
            this.toastr.error(err.error.message || 'There was an error');
          }
        });
    }

    else {
      this.enableEditCommisionType = false;
      this.loaderService.display(false);
    }
  }

  public handleEditCommissionAmount()
  {

    if(!this.agent.commission_type){
      this.toastr.error('Please select commission type first.');
      return;
    }
    else if(this.agent.commission_type == 1 && (this.agent.commission_amount > 100 )){
      this.toastr.error("You can't provide more than 100% commission amount.Please select fixed commission type instead.");
      return;
    }else if(this.agent.commission_type == 0 && (this.agent.commission_amount < 1 || this.agent.commission_amount > 9999999999)){
      this.toastr.error("Commission amount must be 1 or between 1 to 9999999999.");
      return;
    }
    /**/    
    this.loaderService.display(true);
    if (this.oldCommissionAmount !== this.agent.commission_amount) {
      this.agentService.editAgentCommissionAmount({ agent_unique_id: this.agent.agent_unique_id, commission_amount: this.agent.commission_amount })
      .subscribe((res: any) => {
          this.loaderService.display(false);
          
          this.enableEditCommisionAmount = false;
          if (res && res.message) {
            this.agent_commission_amount = this.agent.commission_amount;
            this.oldCommissionAmount = this.agent.commission_amount;
            this.toastr.success(res.message || 'agent commission amount updated successfully.');
            
          }

        }, (err: any) => {
          this.loaderService.display(false);
          if (err && err.error && err.error.message) {
            this.toastr.error(err.error.message || 'There was an error');
          }
        });
    }

    else {
      this.enableEditCommisionAmount = false;
      this.loaderService.display(false);
    }
  }  



}
