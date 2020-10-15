import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges
} from '@angular/core';

import { DisputeService } from '../../services/dispute.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-edit-dispute',
  templateUrl: './edit-dispute.component.html',
  styleUrls: ['./edit-dispute.component.scss']
})
export class EditDisputeComponent implements OnChanges {
  @Input() dispute: any;
  @Output() editedStatus = new EventEmitter<any>();
  public disputeStatus = {
   
  '0': 'Pending',
  '1': 'In Progress',
  '2': 'Resolved',
  };
  public currentStatus = null;
  public error = {
    addBalance: '',
  };
  public oldData = {
    addBalance: '',
  };

  constructor( private disputeService: DisputeService, private toastr: ToastrService, ) { }

  ngOnChanges(changes) {
    if (changes.dispute.currentValue && changes.dispute.currentValue.status) {
      this.currentStatus = changes.dispute.currentValue.status;
    }
  }

  public onSubmit(data) {

    this.disputeService.changeDisputeStatus({ ...this.dispute, ...data }).subscribe(

      (response: any) => {
        if (response) {
          this.toastr.success(response.message);
        }
        this.dispute.status = data.status;
        this.editedStatus.emit({ success: true, update_balance: data.add_balance });
        $('#editModal').modal('hide');
      },
      (error: any) => {
          this.toastr.error(error.error['error']);
          this.editedStatus.emit({
            success: false,
            error: error.message || 'There was an error'
          });
          $('#editModal').modal('hide');
        
      }
    );
  }
}
