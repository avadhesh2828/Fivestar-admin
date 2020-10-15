import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';
import { range, dateFormatString, formatDate, formatDateTimeZone } from '../../services/utils.service';
import { PagesContentService } from '../../services/pageContent.service';
import { Constants } from '../../constants';
import { LoaderService } from '../../shared/loader/loader.service';
import { Options, LabelType } from 'ng5-slider';

const INITIAL_PARAMS = {
  per_page: 20,
  current_page: 1,
  keyword: '',
  order_by: '',
  sort_order: '',
};

@Component({
  selector: 'app-page-list-details',
  templateUrl: './page-list-details.component.html',
  styleUrls: ['./page-list-details.component.scss']
})
export class PageListDetailsComponent implements OnInit {

  public formatDateTimeZone = formatDateTimeZone;
  public params = { ...INITIAL_PARAMS };
  public pageContentList = [];
  public url = "";
  public totalEvent = 0;
  public totalPaginationShow = [];
  public totalPages = 0;
  options: Options = {
    floor: 0,
    ceil: 10000
  };
  public currentPromotion: any;
  public confirmbMessage = '';

  constructor(
    private pagesContentService: PagesContentService,
    private toastr: ToastrService,
    private loaderService: LoaderService
     ) { }

  ngOnInit() {
    this.getAllPageList();
  }

  public getAllPageList() {
    this.loaderService.display(true);
    this.createUrl();
    this.pagesContentService.getAllPageList(this.url).pipe(first())
      .subscribe((promotion: any) => {
        this.pageContentList = promotion.data.data;
        this.createPaginationItem(promotion.data.total);
        this.loaderService.display(false);
      }, (err: any) => {
        this.pageContentList = [];
        this.toastr.error(err.error.global_error || 'There was an error.');
      });
  }

  createUrl() {
    this.url = "pages-list?";
    this.url += 'per_page=' + this.params.per_page + '&page=' + this.params.current_page + '&keyword=' + this.params.keyword;
  }

  searchFilter(isReset = false) {
    if (isReset) {
      this.params.keyword = "";
    }
    this.getAllPageList();
  }

  private createPaginationItem(totalEvent: number) {
    this.totalEvent = totalEvent;
    const maxPages: number = Math.ceil(totalEvent / this.params.per_page);
    const end = (this.params.current_page + 5) < maxPages ? this.params.current_page + 5 : maxPages;
    const start = (this.params.current_page - 5) > 1 ? this.params.current_page - 5 : 1;
    this.totalPages = maxPages;
    this.totalPaginationShow = range(end, start);
  }

  public paginateList(newPage: number) {
    if (this.params.current_page === newPage) { return false; }
    this.params.current_page = newPage;
    localStorage.setItem('contestFilters', JSON.stringify(this.params));
    this.getAllPageList();
  }

  public nextOrPreviousPage(deviation: number) {
    this.params.current_page = this.params.current_page + deviation;
    localStorage.setItem('contestFilters', JSON.stringify(this.params));
    this.getAllPageList();
  }

  public formatDate(date) {
    return date.replace(' ', 'T') + 'Z';
  }
}
