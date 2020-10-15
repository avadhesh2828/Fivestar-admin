import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { LoaderService } from '../../shared/loader/loader.service';
import { MatchesService } from '../../services/matches.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import {ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';

const INITIAL_PARAMS = {
  per_page: 20,
  current_page: 1,
  sport_id: 1,
  team_id: -1,
  week: -1,
  league_id: -1,
  dates: [],
};

@Component({
  selector: 'app-add-fight-result',
  templateUrl: './add-fight-result.component.html',
  styleUrls: ['./add-fight-result.component.scss']
})
export class AddFightResultComponent implements OnInit {
  public params = localStorage.getItem('matchListFilters')
    ? JSON.parse(localStorage.getItem('matchListFilters'))
    : { ...INITIAL_PARAMS };
  public matchForm: FormGroup;
  formSubmitted = false;
  formError: any;
  submitted = false;
  maxChars = 200;
  remainChars:any ='';
  public error = false;
  minDate: Date;
  public message: string;
  public victoryTypeList = [];
  public currentMatchData;
  public matchInfo;
  public roundNumbers = [1,2,3,4,5,6,7,8,9,10,11,12];
  public imgURL;
  public matchStatistics;
  public home_stats;
  public away_stats;
  public victory_round = '';
  public victory_type = '';
  public winner = '';
  constructor(
    private matchesService: MatchesService, private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private loaderService: LoaderService,
  ) { }

  ngOnInit() {
    this.imgURL = environment.PLAYER_IMG_URL; 
    const round_reg = /^([1-9]|1[012])$/;
    this.matchForm = this.formBuilder.group({
      away_id:['',   []],
      home_id:['',   []],
      winner:['',   [Validators.required]],
      victory_type:['',   [Validators.required]],
      round:['',   [Validators.required]],
    });
   
    this.getEditMatchDetail();
    this.getAllVictoryType();
  }

  private getEditMatchDetail() {
    this.loaderService.display(true);
    const match_unique_id = this.route.snapshot.paramMap.get('matchId');
    this.matchesService.getEditMatchDetail({ match_unique_id })
      .subscribe((response: any) => {
        if (response.data) {
          this.matchInfo = response.data;
          this.matchStatistics = response.matchStatistics;
          if(this.matchStatistics) {
            this.home_stats = JSON.parse(this.matchStatistics.home_stats);
            this.away_stats = JSON.parse(this.matchStatistics.away_stats);
            if(this.home_stats.victory_round > 0) {
              this.victory_round = this.home_stats.victory_round;
              this.victory_type = this.home_stats.victory_type;
              this.winner = 'blue_winner';
            }
            if(this.away_stats.victory_round > 0) {
              this.victory_round = this.away_stats.victory_round;
              this.victory_type = this.away_stats.victory_type;
              this.winner = 'red_winner';
            }
          }
        }
        this.loaderService.display(false);
        // this.getH2H();
        this.error = false;
      }, () => {
        this.error = true;
      });
  }

  private getAllVictoryType() {
    this.matchesService.getAllVictoryType({ 'league_id': this.params.league_id })
      .subscribe((response: any) => {
        if (response) {
          this.victoryTypeList = response.data;
        }
        this.error = false;
      }, () => {
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


  onSubmit() 
  {
      this.submitted = true;
      if (this.matchForm.invalid) {
        return;
      }
      else{
      const formInputData = {
        away_id:this.matchInfo.away,
        home_id:this.matchInfo.home,
        match_id:this.matchInfo.match_id,
        victory_type:this.f.victory_type.value,
        winner:this.f.winner.value,
        round:this.f.round.value
      };
      
      this.matchesService.addFightResult(formInputData).subscribe(
        (response: any) => {
          if (response) {
            this.toastr.success(response.message);
            this.router.navigate(['/matches']);
          }
        },
        (error: any) => {
          let errorMessage = '';
          this.toastr.error(errorMessage || 'Some error occurred.');
          //this.formSubmitted = false;
        });
    }
  }

  
}
