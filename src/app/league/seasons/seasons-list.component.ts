import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { LeagueService } from '../../services/league.service';
import { ActivatedRoute } from '@angular/router';
import { range, dateFormatString, formatDateTimeZone } from '../../services/utils.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { LoaderService } from '../../shared/loader/loader.service';
import { Constants } from '../../constants';

const INITIAL_PARAMS = {
  per_page: 20,
  current_page: 1,
  sort_field: 'season_year',
  sort_order: 'ASC',
  keyword: '',
  league_id:'',
  seasons_year:-1,
};
@Component({
  selector: 'app-seasons-list',
  templateUrl: './seasons-list.component.html',
  styleUrls: ['./seasons-list.component.scss', '../../shared/scss/shared.scss']
})
export class SeasonsListComponent implements OnInit, AfterViewInit {
  public params = {...INITIAL_PARAMS}
  public seasonsList = null;
  public totalSeasons = 0;
  public totalPaginationShow = [];
  public totalPages = 0;
  public currency_code = Constants.CURRENCY_CODE;
  public error = false;
  public currentAgent = null;
  public AllseasonYear = [];
  public dateFormatString = dateFormatString;
  public formatDateTimeZone = formatDateTimeZone;
  searchTextChanged: Subject<string> = new Subject<string>();

  constructor(
    private leagueService: LeagueService,
    private toastr: ToastrService,
    private loaderService: LoaderService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.params = localStorage.getItem('leaguesseasonsFilters')
    ? JSON.parse(localStorage.getItem('leaguesseasonsFilters'))
    : { ...INITIAL_PARAMS };
    localStorage.removeItem('leaguesseasonsFilters');
    
    this.getSeasonsList();
    this.getAllSeasonsYear();
    this.searchTextChanged.pipe(debounceTime(1000))
      .subscribe(model => this.getSeasonsList());
  }

  search() {
    this.params.current_page = 1;
    this.searchTextChanged.next();
  }


  ngAfterViewInit() {
    const that = this;
    // Listen for bootstrap modal's hidden event to reset form
    $('#editModal').on('hidden.bs.modal', function () {
      that.currentAgent = null;
      $(this).find('textarea').val('').end();
    });
  }


  public getSeasonsList() {
    this.loaderService.display(true);
    this.params.league_id= this.route.snapshot.paramMap.get('leagueId');
    this.leagueService.getAllSeasons(this.params)
      .subscribe((seasons_list: []) => {
        this.loaderService.display(false);
        if (seasons_list['data'] && seasons_list['data'].data) {
          this.seasonsList = seasons_list['data'].data;
          this.createPaginationItem(seasons_list['data'].total);
        }
        this.error = false;
      }, (err: Error) => {
        this.loaderService.display(false);
        this.error = true;
      });
  }


   private getAllSeasonsYear() {
    this.leagueService.getAllSeasonsYear({ 'league_id': this.params.league_id })
      .subscribe((response: any) => {
        if (response) {
          this.AllseasonYear = response.data;
        }
        this.error = false;
      }, () => {
        this.error = true;
      });
  }

  private createPaginationItem(totalSeasons: number) {
    this.totalSeasons = totalSeasons;
    const maxPages: number = Math.ceil(totalSeasons / this.params.per_page);
    const end = (this.params.current_page + 5) < maxPages ? this.params.current_page + 5 : maxPages;
    const start = (this.params.current_page - 5) > 1 ? this.params.current_page - 5 : 1;
    this.totalPages = maxPages;
    this.totalPaginationShow = range(end, start);
  }

  public paginateList(newPage: number) {
    if (this.params.current_page === newPage) { return false; }
    this.params.current_page = newPage;
    localStorage.setItem('leaguesseasonsFilters', JSON.stringify(this.params));
    this.getSeasonsList();
  }

  public nextOrPreviousPage(deviation: number) {
    this.params.current_page = this.params.current_page + deviation;
    localStorage.setItem('leaguesseasonsFilters', JSON.stringify(this.params));
    this.getSeasonsList();
  }

  public searchFilter(type?: string) {
    localStorage.setItem('leaguesseasonsFilters', JSON.stringify(this.params));
    if (type === 'reset') {
      this.params = { ...INITIAL_PARAMS };
      localStorage.removeItem('leaguesseasonsFilters');
    }
    this.params.current_page = 1;
    this.getSeasonsList();
  }

}
