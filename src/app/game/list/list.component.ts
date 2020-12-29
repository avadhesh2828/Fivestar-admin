import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { GamesService } from '../../services/games.service';
import { range, dateFormatString, formatDateTimeZone } from '../../services/utils.service';
import { STATUS } from '../constants';
import { Subject } from 'rxjs';
import { LoaderService } from '../../shared/loader/loader.service';
import { Constants } from '../../constants';
import { SubscriptionService } from '../../services/subscription.service';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime } from 'rxjs/operators';
import { Location } from '@angular/common';

const INITIAL_PARAMS = {
  per_page: 10,
  current_page: 1,
  status: -1,
  category: -1,
  keyword: ''
};

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  public params = { ...INITIAL_PARAMS };
  public gameList = [];
  public categories = [];
  public totalGames = 0;
  public totalPaginationShow = [];
  public totalPages = 0;
  public gameStatus = STATUS;
  public error = false;
  public gameInfo :any;
  public isEditabel = 0;

  public dateFormatString = dateFormatString;
  public formatDateTimeZone = formatDateTimeZone;
  public url = 'game/list?';
  formSubmitted = false;

  searchTextChanged: Subject<string> = new Subject<string>();

  constructor(
    private gamesService: GamesService,
    private toastr: ToastrService,
    private location: Location,
    private loaderService: LoaderService,
    public subscriptionService: SubscriptionService,
    public translate: TranslateService,
  ) { 
    this.subscriptionService.language.subscribe((lang) => {
      this.translate.setDefaultLang(lang);  // this will happen on every change
    });
  }

  ngOnInit() {
    this.getCategory();
    this.getGameList();
    this.searchTextChanged.pipe(debounceTime(1000))
      .subscribe(model => this.getGameList());
  }

  search() {
    this.params.current_page = 1;
    this.searchTextChanged.next();
  }


  private createUrl() {
    this.url = 'game/list?';
    this.url += 'per_page=' + this.params.per_page + '&page=' + this.params.current_page + '&status=' + this.params.status + '&category=' + this.params.category + '&keyword=' + this.params.keyword;
  }

  public getGameList() {
    this.loaderService.display(true);
    this.createUrl();
    this.gamesService.getGames(this.url)
      .subscribe((game: []) => {
        this.loaderService.display(false);
        if (game['data'] && game['data'].data) {
          this.gameList = game['data'].data;
          this.createPaginationItem(game['data'].total);
        }
        this.error = false;
      }, (err: Error) => {
        this.loaderService.display(false);
        this.error = true;
      });
  }

  private createPaginationItem(totalGame: number) {
    this.totalGames = totalGame;
    const maxPages: number = Math.ceil(totalGame / this.params.per_page);
    const end = (this.params.current_page + 5) < maxPages ? this.params.current_page + 5 : maxPages;
    const start = (this.params.current_page - 5) > 1 ? this.params.current_page - 5 : 1;
    this.totalPages = maxPages;
    this.totalPaginationShow = range(end, start);
  }

  public paginateList(newPage: number) {
    if (this.params.current_page === newPage) { return false; }
    this.params.current_page = newPage;
    this.getGameList();
  }

  public nextOrPreviousPage(deviation: number) {
    this.params.current_page = this.params.current_page + deviation;
    this.getGameList();
  }

  public searchFilter(type?: string) {
    if (type === 'reset') {
      this.params = { ...INITIAL_PARAMS };
    }
    this.params.current_page = 1;
    this.getGameList();
  }

  public changeGameStatus(gameId: any, status: any) {
    this.formSubmitted = true;
    const forminputdata = {
      status : status
    };    
    this.gamesService.changeGameStatus(gameId, forminputdata).pipe()
      .subscribe((res: any) => {
        this.formSubmitted = false;
        this.toastr.success(res.message || 'Game status changed Sucessfully.');
        this.getGameList();
      }, err => {
        const errorMessage = '';
        this.toastr.error(errorMessage || err.error.global_error || err.error.message || 'Some error occurred while change game status.');
        this.formSubmitted = false;
      });

  }

  goBack() {
    this.location.back();
  }

  public getCategory() {
    this.loaderService.display(true);
    this.gamesService.category()
      .subscribe((cat: []) => {
        this.loaderService.display(false);
        if (cat['data']) {
          this.categories = cat['data'];
        }
        this.error = false;
      }, (err: Error) => {
        this.loaderService.display(false);
        this.error = true;
      });
  }

  public onSaveFeaturedChanged(game:object, value:boolean){
    this.gameInfo = game;
    this.formSubmitted = true;
    const forminputdata = {
      is_featured : value
    };    
    this.gamesService.changeGameFeaturedStatus(this.gameInfo.game_id, forminputdata).pipe()
      .subscribe((res: any) => {
        this.formSubmitted = false;
        this.toastr.success(res.message || 'Game status changed Sucessfully.');
        this.getGameList();
      }, err => {
        const errorMessage = '';
        this.toastr.error(errorMessage || err.error.global_error || err.error.message || 'Some error occurred while change game status.');
        this.formSubmitted = false;
      });
  }

  //edit and update agent details
  positionEditable(id: number) {
    this.isEditabel = id;
  }

  public movePosition(game) {
    this.loaderService.display(true);
    this.isEditabel =  game.id; //false;
    const forminputdata = {
      position : game.position
    }; 
    console.log('aaa',forminputdata);   
    this.gamesService.changeGamePosition(game.id, forminputdata).pipe()
      .subscribe((result: any) => {
        this.formSubmitted = false;
        this.isEditabel = 0;
        this.toastr.success(result.message || 'Position changed Sucessfully.');
        this.getGameList();
      }, err => {
        const errorMessage = '';
        this.isEditabel = 0;
        this.toastr.error(errorMessage || err.error.global_error || err.error.message || 'Some error occurred while change position.');
        this.formSubmitted = false;
      });
  }

}