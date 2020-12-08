import {Component, EventEmitter, Input, Output, OnChanges} from '@angular/core';
import { AgentService } from '../../services/agent.service';
import { BLACKOUT_PERIODS } from '../constants';
import { ToastrService } from 'ngx-toastr';
import { LoaderService } from '../../shared/loader/loader.service';
import { ActivatedRoute } from '@angular/router';
import { formatDateTimeZone, dateFormatString } from '../../services/utils.service';
import { AGENT_STATUS } from '../constants';
import { TranslateService } from '@ngx-translate/core';
import { SubscriptionService } from '../../services/subscription.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-edit-agent',
  templateUrl: './edit-agent.component.html',
  styleUrls: ['./edit-agent.component.scss']
})
export class EditAgentComponent implements OnChanges {
  @Input() agent: any;
  @Output() editedStatus = new EventEmitter<any>();
  // public agentStatus = {
  //   '0': 'Inactive',
  //   '1': 'Active',
  //   '2': 'Not verified email',
  //   '3': 'Banned',
  //   '4': 'Deleted'
  // };
  public currentStatus = null;
  public addBalance = null;
  public blackoutPeriods = BLACKOUT_PERIODS;
  public selectedBlackoutPeriod = BLACKOUT_PERIODS['1 day'];
  // public error = {
  //   addBalance: '',
  // };
  // public oldData = {
  //   addBalance: '',
  // };

  public formatDateTimeZone = formatDateTimeZone;
  public dateFormatString = dateFormatString;
  public agentStatus = AGENT_STATUS;
  public agents = null;
  public error = false;
  public editAgentId = 0;
  public maxBalance:any;

  constructor(private userService: UserService, private agentService: AgentService, private toastr: ToastrService, private loaderService: LoaderService, private route: ActivatedRoute, public subscriptionService: SubscriptionService, public translate: TranslateService) { 
    this.subscriptionService.language.subscribe((lang) => {
      this.translate.setDefaultLang(lang);  // this will happen on every change
    });
  }

  ngOnChanges(changes) {
    this.addBalance = '';
    if (changes.agent.currentValue && changes.agent.currentValue.status) {
      this.currentStatus = changes.agent.currentValue.status;
    }
  }

  ngOnInit() {
    this.getAgentDetail();
    this.userService.currentUser.subscribe((usr: any) => {
      this.maxBalance = (usr.role_id == 1)? '':usr.balance;
    });
  }

  private getAgentDetail() {
    this.loaderService.display(true);
    const userId = this.route.snapshot.paramMap.get('agentId');
    this.agentService.getAgentDetails(userId)
      .subscribe((agent) => {
        this.loaderService.display(false);
        if (agent['data']) {
          this.agents = agent['data'];
        }
      }, (err: object) => {
        this.loaderService.display(false);
        this.error = true;
      });
  }


  //edit and update agent details
  setAgentEditable(admin_id: number) {
    this.editAgentId = admin_id;
  }

  saveAgentDetails(agent: any) {
    if (agent.admin_id) {
      const forminputdata = {
        'agent_id'         : agent.admin_id,
        'score'            : agent.setMoreScore,
        'phone'            : agent.phone,
        'new_password'     : agent.new_password,
        'confirm_password' : agent.confirm_password  
      };
      this.agentService.updateAgent(forminputdata)
        .subscribe((response: any) => {
          if (response) {
            this.toastr.success(response.message);
            this.editAgentId = 0;
            this.getAgentDetail();
          }
        }, (error: any) => {
          this.toastr.error(error.error['global_error']);
        });

    }
    
  }

  // public onSubmit(data) {

  //   this.agentService.changeAgentStatus({ ...this.agent, ...data }).subscribe(

  //     (response: any) => {
  //       if (response) {
  //         this.toastr.success("Agent Updated Successfully!");
  //       }
  //       this.agent.status = data.status;
  //       this.agent.balance = parseInt(this.agent.balance, 10) + parseInt(this.addBalance, 10);
  //       this.editedStatus.emit({ success: true, update_balance: data.add_balance });
  //       $('#editModal').modal('hide');
  //     },
  //     (error: any) => {
  //       if (error.error.error) {
  //         this.oldData.addBalance = this.addBalance;
  //         this.error.addBalance = error.error.error.add_balance;
  //       } else {
  //         this.toastr.error(error.error['error']);
  //         this.editedStatus.emit({
  //           success: false,
  //           error: error.message || 'There was an error'
  //         });
  //         $('#editModal').modal('hide');
  //       }
  //     }
  //   );
  // }
}
