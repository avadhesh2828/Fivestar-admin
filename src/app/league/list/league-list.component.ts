import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { LeagueService } from '../../services/league.service';
import { range, dateFormatString, formatDateTimeZone } from '../../services/utils.service';
import { LEAGUE_STATUS } from '../constants';
import { Constants } from '../../constants';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { LoaderService } from '../../shared/loader/loader.service';

const INITIAL_PARAMS = {
  items_perpage: 20,
  current_page: 1,
  sort_field: 'name',
  sort_order: 'ASC',
  team_id: -1,
  position: 'All',
  keyword: '',
  status: -1,
};
@Component({
  selector: 'app-league-list',
  templateUrl: './league-list.component.html',
  styleUrls: ['./league-list.component.scss', '../../shared/scss/shared.scss']
})
export class LeagueListComponent implements OnInit, AfterViewInit {
  public params = localStorage.getItem('adminuserFilters')
    ? JSON.parse(localStorage.getItem('adminuserFilters'))
    : { ...INITIAL_PARAMS };
  public leagueList = null;
  public totalLeagues = 0;
  public totalPaginationShow = [];
  public totalPages = 0;
  public leagueStatus = LEAGUE_STATUS;
  public currency_code = Constants.CURRENCY_CODE;
  public error = false;
  public currentPlayer = null;
  public allTeams = [];
  public allPositions = [];
  public dateFormatString = dateFormatString;
  public formatDateTimeZone = formatDateTimeZone;
  searchTextChanged: Subject<string> = new Subject<string>();

  constructor(
    private leagueService: LeagueService,
    private toastr: ToastrService,
    private loaderService: LoaderService
  ) { }

  ngOnInit() {
    this.getLeagueList();
    this.searchTextChanged.pipe(debounceTime(1000))
      .subscribe(model => this.getLeagueList());
  }

  search() {
    this.params.current_page = 1;
    this.searchTextChanged.next();
  }


  ngAfterViewInit() {
    const that = this;
  }


  public getLeagueList() {
    this.loaderService.display(true);
    this.leagueService.getAllLeagues()
      .subscribe((league: []) => {
        this.loaderService.display(false);
        // console.log(user);
        if (league['data'] && league['data']) {
          this.leagueList = league['data'];
          this.createPaginationItem(league['total']);
        }
        this.error = false;
      }, (err: Error) => {
        this.loaderService.display(false);
        this.error = true;
      });
  }

  private createPaginationItem(totalLeagues: number) {
    this.totalLeagues = totalLeagues;
    const maxPages: number = Math.ceil(totalLeagues / this.params.items_perpage);
    const end = (this.params.current_page + 5) < maxPages ? this.params.current_page + 5 : maxPages;
    const start = (this.params.current_page - 5) > 1 ? this.params.current_page - 5 : 1;
    this.totalPages = maxPages;
    this.totalPaginationShow = range(end, start);
  }

  public paginateList(newPage: number) {
    if (this.params.current_page === newPage) { return false; }
    this.params.current_page = newPage;
    localStorage.setItem('adminleagueFilters', JSON.stringify(this.params));
    this.getLeagueList();
  }

  public nextOrPreviousPage(deviation: number) {
    this.params.current_page = this.params.current_page + deviation;
    localStorage.setItem('adminleagueFilters', JSON.stringify(this.params));
    this.getLeagueList();
  }

  public searchFilter(type?: string) {
    // this.params.current_page = 1;
    localStorage.setItem('adminleagueFilters', JSON.stringify(this.params));
    if (type === 'reset') {
      this.params = { ...INITIAL_PARAMS };
      localStorage.removeItem('adminleagueFilters');
    }
    this.params.current_page = 1;
    this.getLeagueList();
  }
}
