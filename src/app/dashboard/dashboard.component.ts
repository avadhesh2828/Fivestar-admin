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
  saleData = [
    { name: "Mobiles", value: 105000 },
    { name: "Laptop", value: 55000 },
    { name: "AC", value: 15000 },
    { name: "Headset", value: 150000 },
    { name: "Fridge", value: 20000 }
  ];

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
