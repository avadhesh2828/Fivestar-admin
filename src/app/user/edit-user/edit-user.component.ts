import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges
} from '@angular/core';

import { UserService } from '../../services/user.service';
import { BLACKOUT_PERIODS } from '../constants';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent implements OnChanges {
  @Input() user: any;
  @Output() editedStatus = new EventEmitter<any>();
  public userStatus = {
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

  constructor(private userService: UserService, private toastr: ToastrService, ) { }

  ngOnChanges(changes) {
    this.addBalance = '';
    if (changes.user.currentValue && changes.user.currentValue.status) {
      this.currentStatus = changes.user.currentValue.status;
    }
  }

  // public onSubmit(data) {

  //   this.userService.changeUserStatus({ ...this.user, ...data }).subscribe(
  //     (response: any) => {
  //       if (response) {
  //         this.toastr.success(response.message);
  //       }
  //       this.user.status = data.status;
  //       this.user.balance = parseInt(this.user.balance, 10) + parseInt(this.addBalance, 10);
  //       this.editedStatus.emit({ success: true, update_balance: data.add_balance });
  //       $('#editModal').modal('hide');
  //     },
  //     (error: any) => {
  //       if (error.error.error) {
         
  //         this.oldData.addBalance = this.addBalance;
  //         this.error.addBalance = error.error.error.add_balance;
  //       } else {         
  //         this.toastr.error(error.error.message);
  //         this.editedStatus.emit({
  //           success: false,
  //           error: error.error.message || 'There was an error'
  //         });
  //         $('#editModal').modal('hide');
  //       }
  //     }
  //   );
  // }
}
