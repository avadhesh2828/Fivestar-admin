import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';

import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { formatDateTime, formatDate } from '../../services/utils.service';
import { SubscriptionService } from '../../services/subscription.service';
import { TranslateService } from '@ngx-translate/core';
import { SettingService } from 'src/app/services/setting.service';
import { LoaderService } from '../../shared/loader/loader.service';

@Component({
  selector: 'app-app-version',
  templateUrl: './app-version.component.html',
  styleUrls: ['./app-version.component.scss']
})
export class AppVersionComponent implements OnInit {

  public newForm: FormGroup;
  formSubmitted = false;
  formError: any;
  submitted = false;
  public error = false;
  public message: string;
  public version : any = null;

  constructor(
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private router: Router, private location: Location,
    public subscriptionService: SubscriptionService,
    public translate: TranslateService,
    public settingService: SettingService,
    private loaderService: LoaderService,
  ) {
    this.subscriptionService.language.subscribe((lang) => {
      this.translate.setDefaultLang(lang);  // this will happen on every change
    });
  }

  ngOnInit() {
    this.getversion();
  }

  private getversion() {
    this.loaderService.display(true);
    this.settingService.getVersion()
      .subscribe((dat) => {
        this.loaderService.display(false);
        if (dat['data']) {
          this.version = dat['data'];
        }
      }, (err: object) => {
        this.loaderService.display(false);
        this.error = true;
      });
  }

  goBack() {
    this.location.back();
  }

  updateAppVersion(id:any) {
    const forminputdata = {
      'android_version' : this.version.android_version,
      'android_link'    : this.version.android_link,
      'ios_version'     : this.version.ios_version,
      'ios_link'        : this.version.ios_link
    };
    this.settingService.updateVersion( id , forminputdata).pipe()
        .subscribe((res: any) => {
          this.formSubmitted = false;
          if (res) {
            this.toastr.success(res.message || 'Version updated Sucessfully.');
            this.router.navigate(['/setting']);
            this.getversion();

          }
        }, err => {
          const errorMessage = '';
          this.toastr.error(errorMessage || err.error.global_error || 'Some error occurred while updating version.');
          this.formSubmitted = false;
        });
  }

  handleReset() {
    this.getversion();
  }
}
