import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { formatDateTimeZone, dateFormatString } from '../../services/utils.service';
import { DisputeService } from '../../services/dispute.service';
import { DISPUTE_STATUS } from '../constants';
import { Constants } from '../../constants';
import { LoaderService } from '../../shared/loader/loader.service';


@Component({
  selector: 'app-dispute-detail',
  templateUrl: './dispute-detail.component.html',
  styleUrls: ['./dispute-detail.component.scss']
})
export class DisputeDetailComponent implements OnInit {

  public dispute = null;
  public error = false;
  public enableEdit = false;
  public formatDateTimeZone = formatDateTimeZone;
  public dateFormatString = dateFormatString;
  public disputeStatus = DISPUTE_STATUS;
  public dispute_status = '';
  public oldStatus = '';
  public currency_code = Constants.CURRENCY_CODE;


  constructor(
     private disputeService: DisputeService, private route: ActivatedRoute, private toastr: ToastrService,
    private loaderService: LoaderService) { }

  ngOnInit() {
    this.getDisputeDetail();
  }

  private getDisputeDetail() {
    this.loaderService.display(true);
    const id = this.route.snapshot.paramMap.get('disputeId');
    this.disputeService.getDisputeDetails(id)
      .subscribe((dispute) => {
        this.loaderService.display(false);
        if (dispute['data']) {
          this.dispute = dispute['data'];
          this.oldStatus = this.dispute['status'];
        }
      }, (err: object) => {
        this.loaderService.display(false);
        this.error = true;
      });
  }


  public toggleEditStatus() {
    this.dispute_status = this.dispute.status || '';
    this.enableEdit = !this.enableEdit;
  }

  public formatDate(date) {
    if (date[date.length - 3] === '+') {
      return new Date(date + ':00');
    }
    return new Date(date);
  }

   public handleEditStatus()
  {
    this.loaderService.display(true);
    if (this.oldStatus !== this.dispute.status) {
      this.disputeService.changeDisputeStatus({ dispute_id: this.dispute.dispute_id,status: this.dispute.status })
      .subscribe((res: any) => {
          this.loaderService.display(false);
          
          this.enableEdit = false;
          if (res && res.message) {
            this.dispute_status = this.dispute.status;
            this.oldStatus = this.dispute.status;
            this.toastr.success(res.message || 'Status updated successfully.');
            
          }

        }, (err: any) => {
          this.loaderService.display(false);
          if (err && err.error && err.error.message) {
            this.toastr.error(err.error.message || 'There was an error');
          }
        });
    }

    else {
      this.enableEdit = false;
      this.loaderService.display(false);
    }
  }
}
