import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { DashboardService } from '../services/dashboard.service';
import { Constants } from '../constants';
import { SubscriptionService } from '../services/subscription.service';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit {
  saleData = [
    { name: "Get Money", value: 105000 },
    { name: "Golden Ball", value: 55000 },
    { name: "Luck88", value: 15000 },
    { name: "Icy Bar", value: 150000 },
    { name: "Ander Bahar", value: 20000 }
  ];

  public currency_code = Constants.CURRENCY_CODE;
  stats: any;
  constructor(
    private dashboardService: DashboardService, 
    private toastr: ToastrService,
    public subscriptionService: SubscriptionService,
    public translate: TranslateService
  ) { 
    this.subscriptionService.language.subscribe((lang) => {
      this.translate.setDefaultLang(lang);  // this will happen on every change
    });
  }

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
