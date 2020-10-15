import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatchesService } from '../../services/matches.service';
import { formatDate, range, formatDateTimeZone, dateFormatString, getJsonValueOfKey } from '../../services/utils.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { LoaderService } from '../../shared/loader/loader.service';
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
  selector: 'app-matches-list',
  templateUrl: './matches-list.component.html',
  styleUrls: ['./matches-list.component.scss', '../../shared/scss/shared.scss']
})
export class MatchesListComponent implements OnInit {
  public addFightPointForm: FormGroup;
  formSubmitted = false;
  formError: any;
  submitted = false;
  public params = localStorage.getItem('matchListFilters')
    ? JSON.parse(localStorage.getItem('matchListFilters'))
    : { ...INITIAL_PARAMS };
  public matchesList = null;
  public totalMatches = 0;
  public totalPaginationShow = [];
  public totalPages = 0;
  public error = false;
  public currentSport = null;
  public sports = [];
  public allteams = [];
  public leagues = [];
  public allLeagues = [];
  public allTeams = [];
  public allWeeks = [];
  public victoryTypeList = [];
  formatDateTimeZone = formatDateTimeZone;
  dateFormatString = dateFormatString;
  public getJsonValueOfKey = getJsonValueOfKey;
  public url: string = 'season/get_all_season_schedule?';
  imgURL:any;
  public currentMatch: any;
  public confirmbMessage = '';
  public currentMatchData;
  public roundNumbers = [1,2,3,4,5,6,7,8,9,10,11,12];
  public addResult = {
    away_id: 0,
    home_id:0,
    match_id:0,
    victory_type:0,
    round:0,
    blue_corner_point:"",
    red_corner_point:""
  };
  public formInputData;

  constructor(private matchesService: MatchesService, private loaderService: LoaderService, private toastr: ToastrService,private formBuilder: FormBuilder,) { }

  ngOnInit() {
    this.getTeamFilters();
    this.imgURL = environment.PLAYER_IMG_URL; 
    this.addFightPointForm = this.formBuilder.group({
      away_id:['',   []],
      home_id:['',   []],
      winner:['',   [Validators.required]],
      victory_type:['',   [Validators.required]],
      round:['',   [Validators.required]],

    }); 
    // this.addFightPointForm.addControl('away_id', new FormControl('', Validators.required));
    // this.addFightPointForm.addControl('home_id', new FormControl('', Validators.required));
    // this.addFightPointForm.addControl('victory_type', new FormControl('', Validators.required));
    // this.addFightPointForm.addControl('round', new FormControl('', Validators.required));
    // this.addFightPointForm.addControl('blue_corner_point', new FormControl('', Validators.required));
    // this.addFightPointForm.addControl('red_corner_point', new FormControl('', Validators.required));
  }

  initLink(){
    return this.formBuilder.group({
    });
  }

  // getting form control values
  get f() {
    return this.addFightPointForm.controls;
  }

  onItemChange(value){
    console.log(" Value is : ", value );
 }

  private createUrl(date) {
    this.url = 'season/get_all_season_schedule?';
    this.url += 'per_page=' + this.params.per_page + '&page=' + this.params.current_page + '&league_id=' + this.params.league_id +'&team_id=' + this.params.team_id +'&week=' + this.params.week + '&dates=' + JSON.stringify(date);
  }

  private getTeamFilters() {
    this.matchesService.getAllLeagues()
      .subscribe((response: any) => {
        if (response.data) {
          this.allLeagues = response.data.results;
          if (!this.params.league_id) {
            this.params.league_id = this.allLeagues[0]['league_id'];
          }
          if (this.params.dates && this.params.dates.length) {
            this.params.dates = this.params.dates.map((date: string) => new Date(date));
          }
          this.getTeams();
          this.getAllWeeks();
        }
        this.error = false;
      }, () => {
        this.error = true;
      });
  }
  private getTeams() {
    this.matchesService.getAllTeams({ 'league_id': this.params.league_id })
      .subscribe((response: any) => {
        if (response) {
          this.allTeams = response.data;
        }
        this.error = false;
      }, () => {
        this.error = true;
      });
  }

  private getAllWeeks() {
    this.getMatches();
    this.matchesService.getAllWeeks({ 'league_id': this.params.league_id })
      .subscribe((response: any) => {
        if (response) {
          this.allWeeks = response.data;
        }
        this.error = false;
      }, () => {
        this.error = true;
      });
  }

  private getMatches() {
    const date = this.params.dates.length == 2 ? {
      fromdate: `${formatDate(this.params.dates[0])} 00:00:00`,
      todate: `${formatDate(this.params.dates[1])} 23:59:59`,
      time_zone: this.params.dates[0].toString().split(' ')[5],
    } : [];

    this.loaderService.display(true);
    this.createUrl(date);
    const country = this.params.country ? this.params.country.name : '';
    this.matchesService.getAllMatches(this.url)
      .subscribe((response: any) => {
        if (response.data && response.data.data) {
          this.matchesList = response.data.data;
          this.createPaginationItem(response.data.total);
        }
        this.loaderService.display(false);
        this.error = false;
      }, () => {
        this.error = true;
      });
  }

  private createPaginationItem(totalMatches: number) {
    this.totalMatches = totalMatches;
    const maxPages: number = Math.ceil(totalMatches / this.params.per_page);
    const end = (this.params.current_page + 5) < maxPages ? this.params.current_page + 5 : maxPages;
    const start = (this.params.current_page - 5) > 1 ? this.params.current_page - 5 : 1;
    this.totalPages = maxPages;
    this.totalPaginationShow = range(end, start);
  }

  public paginateList(newPage: number) {
    if (this.params.current_page === newPage) { return false; }
    this.params.current_page = newPage;
    localStorage.setItem('matchListFilters', JSON.stringify(this.params));
    this.getMatches();
  }

  public nextOrPreviousPage(deviation: number) {
    this.params.current_page = this.params.current_page + deviation;
    localStorage.setItem('matchListFilters', JSON.stringify(this.params));
    this.getMatches();
  }

  // public onLeagueChange(filterAlreadySet?: boolean) {
  //   this.allTeams = [];
  // }

  // public onCountryChange(filterAlreadySet?: boolean) {
  //   if (!filterAlreadySet) {

  //     this.params.dates = '';
  //   }
  //   if (this.params.country === '') {
  //     return this.leagues = [];
  //   }
  //   const endIndex = this.params.country.endIndex ? (this.params.country.endIndex + 1) : undefined;
  //   this.leagues = this.allLeagues[this.params.sport_id].slice(this.params.country.startIndex, endIndex);
  // }

  public searchFilter(type?: string) {
    // if (this.params.dates) {
    //   this.params.min_date = `${formatDate(this.params.dates[0])} 00:00:00`;
    //   this.params.max_date = `${formatDate(this.params.dates[1])} 23:59:59`;
    //   this.params.time_zone = this.params.dates[0].toString().split(' ')[5];
    // }
    localStorage.setItem('matchListFilters', JSON.stringify(this.params));
    if (type === 'reset') {
      this.params = { ...INITIAL_PARAMS };
      localStorage.removeItem('matchListFilters');
    }
    this.params.current_page = 1;
    this.getMatches();
    // this.getAllWeeks();
    // this.getTeams();
  }
  addFightResult(match)
  {
    if(match.match_statistic_id > 0){
      $('#resultConfirm').modal('show');
      this.currentMatchData ="";
      //return;
    }else{
      this.currentMatchData = match;
      this.getAllVictoryType();
      $('#addFightResultModal').modal('show');
    }
    
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
  public onSubmit() {
    this.submitted = true;
    if (this.addFightPointForm.invalid) {
      return;
    } else{
      this.formInputData = {
          away_id:this.currentMatchData.away_id,
          home_id:this.currentMatchData.home_id,
          match_id:this.currentMatchData.match_id,
          victory_type:this.f.victory_type.value,
          winner:this.f.winner.value,
          round:this.f.round.value
      };
    }
    this.matchesService.addFightResult(this.formInputData).subscribe(
      (response: any) => {
        if (response) {
          this.toastr.success(response.message);
          this.getMatches();
          this.handleReset();
        }
        
        $('#addFightResultModal').modal('hide');
      },
      (error: any) => {
        let errorMessage = '';
        this.toastr.error(errorMessage || 'Some error occurred.');
        //this.formSubmitted = false;
      }
    );
  }
  handleReset() {
    this.addFightPointForm.reset();
    this.submitted = false;
    this.formSubmitted = false;
  }

  deleteConfirm(match) {
    //console.log(news);
    this.currentMatch = match;
    this.confirmbMessage = 'Are you sure you want to Delete "' + this.currentMatch.match_unique_id +'" ?';
    //console.log(event);
    $('#deleteConfirm').modal('show');
  }
  
  delete(){
    this.matchesService.deleteMatch({'match_id':this.currentMatch.match_id})
      .subscribe((res: any) => {
        this.loaderService.display(false);
        if (res) {
          this.toastr.success(res.message || 'Fight Deleted successfully.');
          this.currentMatch ='';
          this.getMatches();
        }
        //this.error = false;
      }, (err: any) => {
          this.loaderService.display(false);
          if (err && err.error && err.error.message) {
            this.toastr.error(err.error.message || 'There was an error');
          }
      });
  }

}
