import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { GamesService } from '../../services/games.service';
import { range, dateFormatString, formatDateTimeZone } from '../../services/utils.service';
import { STATUS } from '../constants';
import { Subject } from 'rxjs';
import { LoaderService } from '../../shared/loader/loader.service';
import { Constants } from '../../constants';

const INITIAL_PARAMS = {
  per_page: 10,
  current_page: 1
};

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  public params = { ...INITIAL_PARAMS };
  public gameList = [];
  public totalGames = 0;
  public totalPaginationShow = [];
  public totalPages = 0;
  public gameStatus = STATUS;
  public error = false;

  public dateFormatString = dateFormatString;
  public formatDateTimeZone = formatDateTimeZone;
  public url = 'game/list?';
  formSubmitted = false;


  constructor(
    private gamesService: GamesService,
    private toastr: ToastrService,
    private loaderService: LoaderService,
  ) { }

  ngOnInit() {
    this.getGameList();
  }

  private createUrl() {
    this.url = 'game/list?';
    this.url += 'per_page=' + this.params.per_page + '&page=' + this.params.current_page;
  }

  public getGameList() {
    this.loaderService.display(true);
    this.createUrl();
    this.gamesService.getGames(this.url)
      .subscribe((game: []) => {
        console.log(game);
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

}