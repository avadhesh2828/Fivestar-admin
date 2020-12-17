import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { formatDateTime, formatDate } from '../../services/utils.service';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';
import { AgentService } from 'src/app/services/agent.service';
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
  agentUserName :any;
  agentBalance : any;
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
    private authService: AuthService,
    private agentService: AgentService,
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
      this.getAgentDetail();
      this.userService.currentUser.subscribe((usr: any) => {
        // this.maxBalance = usr.balance;
        this.maxBalance = (usr.role_id == 1)? '':usr.balance;
        this.scoreForm = this.formBuilder.group({
          'score': ['', [Validators.required, Validators.min(1), Validators.max(this.maxBalance)]],
        });
      });
  }

  private getAgentDetail() {
    this.loaderService.display(true);
    const agentId = this.route.snapshot.paramMap.get('agentId');
    this.agentService.getAgentDetails(agentId)
      .subscribe((user) => {
        this.loaderService.display(false);
        if (user['data']) {
          this.user = user['data'];
          this.agentBalance = this.user.balance;
          this.agentUserName = this.user.username;
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
      var agentId = this.route.snapshot.paramMap.get('agentId');
      const forminputdata = {
        'agent_id': agentId,
        'score'    : this.f.score.value
      };
      this.formSubmitted = true;
      this.agentService.setAgentScore(forminputdata).pipe()
        .subscribe((res: any) => {
          this.formSubmitted = false;
          this.palyerIPList = res.data;
          this.toastr.success(res.message || 'Score set successfully.');
          this.getAgentDetail();
          this.authService.getUserDetails().subscribe((res: any) => {
            this.userService.updateUser(res.data);
          });
        }, err => {
          const errorMessage = '';
          this.toastr.error(errorMessage || err.error.global_error || err.error.message || 'Some error occurred while set score.');
          this.formSubmitted = false;
        });
    }
  }

  handleReset() {
    this.scoreForm.reset();
  }

}