import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { formatDateTime, formatDate } from '../../services/utils.service';
import { UserService } from 'src/app/services/user.service';
import { LoaderService } from '../../shared/loader/loader.service';
import { ActivatedRoute } from '@angular/router';

import { SubscriptionService } from '../../services/subscription.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-set-score',
  templateUrl: './set-score.component.html',
  styleUrls: ['./set-score.component.scss']
})
export class SetScoreComponent implements OnInit {
  public user = null;
  public error = false;
  playerUserName :any;
  playerBalance : any;
  maxBalance : any;
  

  public scoreForm: FormGroup;
  formSubmitted = false;
  formError: any;
  submitted = false;
  palyerIPList = [];

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private userService: UserService,
    public subscriptionService: SubscriptionService,
    public translate: TranslateService,
    private route: ActivatedRoute, 
    private loaderService: LoaderService,
  ) { 
    this.subscriptionService.language.subscribe((lang) => {
      this.translate.setDefaultLang(lang);  // this will happen on every change
    });
  }

  ngOnInit() {
      this.getUserDetail();
      this.userService.currentUser.subscribe((usr: any) => {
        // this.maxBalance = usr.balance;
        this.maxBalance = (usr.role_id == 1)? '':usr.balance;
        this.scoreForm = this.formBuilder.group({
          'score': ['', [Validators.required, Validators.min(1), Validators.max(this.maxBalance)]],
        });
      });
  }

  private getUserDetail() {
    this.loaderService.display(true);
    const userId = this.route.snapshot.paramMap.get('playerId');
    this.userService.getUserDetails(userId)
      .subscribe((user) => {
        this.loaderService.display(false);
        if (user['data']) {
          this.user = user['data'];
          this.playerBalance = this.user.balance;
          this.playerUserName = this.user.username;
        }
      }, (err: object) => {
        this.loaderService.display(false);
        this.error = true;
      });
  }

  get f() {
    return this.scoreForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    if (this.scoreForm.invalid || this.formError) {
      return;
    } else {
      var playerId = this.route.snapshot.paramMap.get('playerId');
      const forminputdata = {
        'player_id': playerId,
        'score'    : this.f.score.value
      };
      this.formSubmitted = true;
      this.userService.setPlayerScore(forminputdata).pipe()
        .subscribe((res: any) => {
          this.formSubmitted = false;
          this.palyerIPList = res.data;
          this.toastr.success(res.message || 'Player LoginIp Found.');
          this.getUserDetail();
        }, err => {
          const errorMessage = '';
          this.toastr.error(errorMessage || err.error.global_error || err.error.message || 'Some error occurred while fetching player login ip.');
          this.formSubmitted = false;
        });
    }
  }

  handleReset() {
    this.scoreForm.reset();
  }

}