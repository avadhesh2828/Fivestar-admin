import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { LoaderService } from '../../shared/loader/loader.service';
import { MatchesService } from '../../services/matches.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import {ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';

@Component({
  selector: 'app-matches-edit',
  templateUrl: './matches-edit.component.html',
  styleUrls: ['./matches-edit.component.scss']
})
export class MatchesEditComponent implements OnInit {

  public matchForm: FormGroup;
  formSubmitted = false;
  formError: any;
  submitted = false;
  maxChars = 200;
  remainChars:any ='';
  public error = false;
  minDate: Date;
  public message: string;
  imgErrorMsg:any;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  public allFighters = [];
  public allSeasons = [];
  public combatTypes = [];
  public weightClasses = [];
  public newsList=[];
  public buttonDisabled = true;
  timepickerVisible = false;
  public championship = true;
  public title_fight = true;
  public main_event = true;
  public matchInfo;
  public scheduledDdate;

  constructor(
    private matchesService: MatchesService, private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private loaderService: LoaderService,
  ) { }

  ngOnInit() {
    const round_reg = /^([1-9]|1[012])$/;
    this.getCombatTypes()
    this.matchForm = this.formBuilder.group({
      combat_type:['',   [Validators.required]],
      scheduled_date:['',   [Validators.required]],
      home_fighter:['',   [Validators.required]],
      // home_fighter_status:['',[Validators.required]],
      // away_fighter_status:['',[Validators.required]],
      away_fighter:['',   [Validators.required]],
      weight_class_id:['',   [Validators.required]],
      championship:['',   []],
      promo_image:['',   []],
      preview_id:['',   []],
      review_id:['',   []],
      title_fight:['',   []],
      main_event:['',   []],
      round:['',   [Validators.required, Validators.pattern(round_reg)]],
      home_point:['',   [Validators.required, Validators.minLength(1),Validators.maxLength(5)]],
      away_point:['',   [Validators.required, Validators.minLength(1),Validators.maxLength(5)]],
    });
    this.minDate = new Date();
    this.matchForm.addControl('scheduled_time', new FormControl(moment(this.minDate).format('HH:mm')));
    this.matchForm.addControl('home_fighter', new FormControl('', Validators.required));
    // this.matchForm.addControl('home_fighter_status', new FormControl('', Validators.required));
    this.matchForm.addControl('away_fighter', new FormControl('', Validators.required));
    // this.matchForm.addControl('away_fighter_status', new FormControl('', Validators.required));
    this.matchForm.addControl('combat_type', new FormControl('', Validators.required));
    this.matchForm.addControl('weight_class_id', new FormControl('', Validators.required));
    this.matchForm.addControl('championship', new FormControl('',));
    this.matchForm.addControl('promo_image', new FormControl('',));
    this.matchForm.addControl('preview_id', new FormControl('', ));
    this.matchForm.addControl('review_id', new FormControl('', ));
    this.matchForm.addControl('title_fight', new FormControl('',));
    this.matchForm.addControl('main_event', new FormControl('',));
    this.matchForm.addControl('round', new FormControl('', [Validators.required,Validators.minLength(1),Validators.maxLength(12)]));
    this.matchForm.addControl('home_point', new FormControl('', [Validators.required,Validators.minLength(1),Validators.maxLength(5)]));
    this.matchForm.addControl('away_point', new FormControl('', [Validators.required,Validators.minLength(1),Validators.maxLength(5)]));
    this.getFightersList();
   
    this.getEditMatchDetail();
    this.getweightClasses();
    this.getNewsList();
  }

  private getEditMatchDetail() {
    this.loaderService.display(true);
    const match_unique_id = this.route.snapshot.paramMap.get('matchId');
    this.matchesService.getEditMatchDetail({ match_unique_id })
      .subscribe((response: any) => {
        if (response.data) {
          this.matchInfo = response.data;
          this.championship = this.matchInfo.championship;
          this.title_fight = this.matchInfo.title_fight;
          this.main_event = this.matchInfo.main_event;
          this.scheduledDdate = new Date(this.matchInfo.scheduled_date_time);
        }
        this.loaderService.display(false);
        // this.getH2H();
        this.error = false;
      }, () => {
        this.error = true;
      });
  }
  public getweightClasses() {
    this.matchesService.getAllWeightClasses({})
      .subscribe((response: any) => {
        this.weightClasses = response.data;
      }, (err: Error) => {
        this.toastr.error(err.message || 'There was an error.');
        this.error = true;
      });
  }
  public getNewsList() {
    this.matchesService.getAllNewsList({})
      .subscribe((response: any) => {
        this.newsList = response.data;
      }, (err: Error) => {
        this.toastr.error(err.message || 'There was an error.');
        this.error = true;
      });
  }

  initLink(){
    return this.formBuilder.group({
        consolationPrize: ['']
    });
  }

  // getting form control values
  get f() {
    return this.matchForm.controls;
  }

  public getFightersList() {
    this.matchesService.getAllFighters({})
      .subscribe((response: any) => {
        this.allFighters = response.data;
        this.allFighters.map((i) => { 
          i.Name = i.last_name + ' ' + i.first_name; 
          //i.player_id = i.player_id.toString(); 
          return i;
        });

      }, (err: Error) => {
        this.toastr.error(err.message || 'There was an error.');
        this.error = true;
      });
  }

  onSubmit() {
    this.submitted = true;
    if (this.matchForm.invalid) {
      return;
    }
    else{
    const formInputData = {
      combat_type:this.f.combat_type.value,
        scheduled_date:moment(this.f.scheduled_date.value).format('YYYY-MM-DD')+' '+moment(this.f.scheduled_time.value).format('HH:mm:ss'),
        home_fighter:this.f.home_fighter.value,
        away_fighter:this.f.away_fighter.value,
        match_unique_id:this.matchInfo.match_unique_id,
        weight_class_id:this.f.weight_class_id.value,
        championship:this.f.championship.value,
        preview_id:this.f.preview_id.value,
        review_id:this.f.review_id.value,
        title_fight:this.f.title_fight.value,
        main_event:this.f.main_event.value,
        round:this.f.round.value,
        home_point:this.f.home_point.value,
        away_point:this.f.away_point.value,
    };
    
    if(formInputData.home_fighter === formInputData.away_fighter){
        this.toastr.error('Favourite and Underdog fighter can not be same. Please choose different fighter.');
        return false;
    }
    this.formSubmitted = true;
    this.matchesService.updateMatch(formInputData).pipe()
      .subscribe((res:any) => {
        this.formSubmitted = false;
        if (res) {
          this.toastr.success( res.message || 'Fight Update Successfully.');
          this.router.navigate(['/matches']);
        }
      }, err => {
        let errorMessage = '';
        this.toastr.error(errorMessage || err.error.GlobalError || 'Some error occurred while updating fight.');
        this.formSubmitted = false;
      });
    }
  }

  public getAllSeason() {
    this.matchesService.getAllSeasons({})
      .subscribe((response: any) => {
        this.allSeasons = response.data;
      }, (err: Error) => {
        this.toastr.error(err.message || 'There was an error.');
        this.error = true;
      });
  }

  public getCombatTypes() {
    this.matchesService.getCombatTypes({})
      .subscribe((response: any) => {
        this.combatTypes = response.data;
      }, (err: Error) => {
        this.toastr.error(err.message || 'There was an error.');
        this.error = true;
      });
  }

  
}
