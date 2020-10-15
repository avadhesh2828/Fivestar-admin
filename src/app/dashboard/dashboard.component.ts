import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { DashboardService } from '../services/dashboard.service';
import { Constants } from '../constants';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit {
  public currency_code = Constants.CURRENCY_CODE;
  stats: any;
  constructor(private dashboardService: DashboardService, private toastr: ToastrService) { }

  ngOnInit() {
    this.dashboardService.getAllStats({}).pipe()
      .subscribe((response: any) => {
        if (response.data) {
          this.stats = response.data;
          //debugger;
        }
      }, err => {
        this.toastr.error(err.message || 'There was an error.');
      });
  }

}
