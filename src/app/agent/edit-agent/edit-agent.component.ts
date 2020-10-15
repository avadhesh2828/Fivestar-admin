import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges
} from '@angular/core';

import { AgentService } from '../../services/agent.service';
import { BLACKOUT_PERIODS } from '../constants';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-edit-agent',
  templateUrl: './edit-agent.component.html',
  styleUrls: ['./edit-agent.component.scss']
})
export class EditAgentComponent implements OnChanges {
  @Input() agent: any;
  @Output() editedStatus = new EventEmitter<any>();
  public agentStatus = {
    '0': 'Inactive',
    '1': 'Active',
    '2': 'Not verified email',
    '3': 'Banned',
    '4': 'Deleted'
  };
  public currentStatus = null;
  public addBalance = null;
  public blackoutPeriods = BLACKOUT_PERIODS;
  public selectedBlackoutPeriod = BLACKOUT_PERIODS['1 day'];
  public error = {
    addBalance: '',
  };
  public oldData = {
    addBalance: '',
  };

  constructor(private agentService: AgentService, private toastr: ToastrService, ) { }

  ngOnChanges(changes) {
    this.addBalance = '';
    if (changes.agent.currentValue && changes.agent.currentValue.status) {
      this.currentStatus = changes.agent.currentValue.status;
    }
  }

  public onSubmit(data) {

    this.agentService.changeAgentStatus({ ...this.agent, ...data }).subscribe(

      (response: any) => {
        if (response) {
          this.toastr.success("Agent Updated Successfully!");
        }
        this.agent.status = data.status;
        this.agent.balance = parseInt(this.agent.balance, 10) + parseInt(this.addBalance, 10);
        this.editedStatus.emit({ success: true, update_balance: data.add_balance });
        $('#editModal').modal('hide');
      },
      (error: any) => {
        if (error.error.error) {
          this.oldData.addBalance = this.addBalance;
          this.error.addBalance = error.error.error.add_balance;
        } else {
          this.toastr.error(error.error['error']);
          this.editedStatus.emit({
            success: false,
            error: error.message || 'There was an error'
          });
          $('#editModal').modal('hide');
        }
      }
    );
  }
}
