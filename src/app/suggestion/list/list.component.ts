import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SuggestionService } from '../../services/suggestion.service';
import { range, dateFormatString, formatDateTimeZone } from '../../services/utils.service';
import { Subject } from 'rxjs';
import { LoaderService } from '../../shared/loader/loader.service';
import { SubscriptionService } from '../../services/subscription.service';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime } from 'rxjs/operators';
import { Location } from '@angular/common';


const INITIAL_PARAMS = {
  per_page: 10,
  current_page: 1,
};

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  public params = { ...INITIAL_PARAMS };
  public suggestionList = [];
  public totalSuggestion = 0;
  public totalPaginationShow = [];
  public totalPages = 0;
  public error = false;

  public dateFormatString = dateFormatString;
  public formatDateTimeZone = formatDateTimeZone;
  public url = 'suggestion/list?';
  formSubmitted = false;

  searchTextChanged: Subject<string> = new Subject<string>();

  constructor(
    private suggestionService: SuggestionService,
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
    this.getSuggestionList();
  }

  private createUrl() {
    this.url = 'suggestion/list?';
    this.url += 'per_page=' + this.params.per_page + '&page=' + this.params.current_page;
  }  

  public getSuggestionList() {
    this.loaderService.display(true);
    this.createUrl();
    this.suggestionService.getSuggestion(this.url)
      .subscribe((sugg: []) => {
        this.loaderService.display(false);
        if (sugg['data'] && sugg['data'].data) {
          this.suggestionList = sugg['data'].data;
          this.createPaginationItem(sugg['data'].total);
        }
        this.error = false;
      }, (err: Error) => {
        this.loaderService.display(false);
        this.error = true;
      });
  }

  private createPaginationItem(totalSuggestion: number) {
    this.totalSuggestion = totalSuggestion;
    const maxPages: number = Math.ceil(totalSuggestion / this.params.per_page);
    const end = (this.params.current_page + 5) < maxPages ? this.params.current_page + 5 : maxPages;
    const start = (this.params.current_page - 5) > 1 ? this.params.current_page - 5 : 1;
    this.totalPages = maxPages;
    this.totalPaginationShow = range(end, start);
  }

  public paginateList(newPage: number) {
    if (this.params.current_page === newPage) { return false; }
    this.params.current_page = newPage;
    this.getSuggestionList();
  }

  public nextOrPreviousPage(deviation: number) {
    this.params.current_page = this.params.current_page + deviation;
    this.getSuggestionList();
  }

  goBack() {
    this.location.back();
  }

  
}