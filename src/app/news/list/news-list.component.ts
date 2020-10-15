import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { NewsService } from '../../services/news.service';
import { range, dateFormatString, formatDateTimeZone } from '../../services/utils.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { LoaderService } from '../../shared/loader/loader.service';
import { Constants } from '../../constants';
import { environment } from '../../../environments/environment';

const INITIAL_PARAMS = {
  per_page: 20,
  current_page: 1,
  sort_field: 'name',
  sort_order: 'ASC',
  country: -1,
  keyword: '',
  status: -1,
};

@Component({
  selector: 'app-news-list',
  templateUrl: './news-list.component.html',
  styleUrls: ['./news-list.component.scss']
})
export class NewsListComponent implements OnInit {
  public params = {...INITIAL_PARAMS}
  public newsList = null;
  public totalNews = 0;
  public totalPaginationShow = [];
  public totalPages = 0;
  public enableEdit = false;
  public oldStatus = '';
  public adv_status = '';
  public advertisment_status = '';
  public currency_code = Constants.CURRENCY_CODE;
  public error = false;
  public currentAgent = null;
  public countryList = [];
  public dateFormatString = dateFormatString;
  public formatDateTimeZone = formatDateTimeZone;
  public currentNews: any;
  public confirmbMessage = '';
  public url: string = 'advertisements/get_advertisement?';
  imgURL:any;

  searchTextChanged: Subject<string> = new Subject<string>();

  constructor(
    private newsService: NewsService,//newsService
    private toastr: ToastrService,
    private loaderService: LoaderService
  ) { }

  ngOnInit() {
    this.imgURL = environment.NEWS_IMG_URL; 
    this.params = localStorage.getItem('agentFilters')
    ? JSON.parse(localStorage.getItem('agentFilters'))
    : { ...INITIAL_PARAMS };
    localStorage.removeItem('agentFilters');
    this.getAdvList();
    this.searchTextChanged.pipe(debounceTime(1000))
      .subscribe(model => this.getAdvList());
  }

  search() {
    this.params.current_page = 1;
    this.searchTextChanged.next();
  }

  private createUrl() {
    this.url = 'news/get_all_news?';
    this.url += 'per_page=' + this.params.per_page + '&page=' + this.params.current_page + '&status=' + this.params.status + '&keyword=' + this.params.keyword;
  }

  public startEdit(news) {
    this.currentNews = news;

  }

  ngAfterViewInit() {
    const that = this;
    // Listen for bootstrap modal's hidden event to reset form
    $('#editModal').on('hidden.bs.modal', function () {
      that.currentAgent = null;
      $(this).find('textarea').val('').end();
    });
  }

  public getAdvList() {
    this.loaderService.display(true);
    this.createUrl();
    this.newsService.getAllNews(this.url)
      .subscribe((news: []) => {
        this.loaderService.display(false);
        if (news['data'] && news['data'].data) {
          this.newsList = news['data'].data;
          // this.oldStatus = this.newsList.status;
          this.createPaginationItem(news['data'].total);
        }
        this.error = false;
      }, (err: Error) => {
        this.loaderService.display(false);
        this.error = true;
      });
  }

  private createPaginationItem(totalNews: number) {
    this.totalNews = totalNews;
    const maxPages: number = Math.ceil(totalNews / this.params.per_page);
    const end = (this.params.current_page + 5) < maxPages ? this.params.current_page + 5 : maxPages;
    const start = (this.params.current_page - 5) > 1 ? this.params.current_page - 5 : 1;
    this.totalPages = maxPages;
    this.totalPaginationShow = range(end, start);
  }

  public paginateList(newPage: number) {
    if (this.params.current_page === newPage) { return false; }
    this.params.current_page = newPage;
    localStorage.setItem('agentFilters', JSON.stringify(this.params));
    this.getAdvList();
  }

  public nextOrPreviousPage(deviation: number) {
    this.params.current_page = this.params.current_page + deviation;
    localStorage.setItem('agentFilters', JSON.stringify(this.params));
    this.getAdvList();
  }

  public searchFilter(type?: string) {
    localStorage.setItem('agentFilters', JSON.stringify(this.params));
    if (type === 'reset') {
      this.params = { ...INITIAL_PARAMS };
      localStorage.removeItem('agentFilters');
    }
    this.params.current_page = 1;
    this.getAdvList();
  }

  // public startEdit(agent) {
  //   this.currentAgent = agent;

  // }

  public onStatusEdit(editStatus: any) {
    if (editStatus.success) {
      this.newsList[this.currentAgent.agentIndex].status = this.currentAgent.status;
      this.newsList[this.currentAgent.agentIndex].balance = this.currentAgent.balance;
    }
  }

  public onStatusSubmit(adv)
  {
   
      this.loaderService.display(true);
       adv.isEditabel = false;
      // if (this.oldStatus !== this.advList.status) {
         this.newsService.editAdvStatus({ ads_unique_id: adv.ads_unique_id, status: adv.status,ads_position_id: adv.ads_position_id })
           .subscribe((res: any) => {
          this.loaderService.display(false);
          if (res && res.message) {
            this.getAdvList();
            this.toastr.success(res.message || 'advertisment status updated successfully.');
          }

        }, (err: any) => {
          this.loaderService.display(false);
          if (err && err.error && err.error.message) {
            this.toastr.error(err.error.message || 'There was an error');
          }
        });
      // }
    //   else {
    //   this.loaderService.display(false);
    // }
    
  }
  deleteNewsConfirm(news) {
    //console.log(news);
    this.currentNews = news;
    this.confirmbMessage = 'Are you sure you want to Delete "' + this.currentNews.news_title +'" ?';
    //console.log(news);
    $('#deleteNewsConfirm').modal('show');
  }
  deleteNews(){
    this.newsService.deleteNews({'news_id':this.currentNews.news_id})
      .subscribe((res: any) => {
        this.loaderService.display(false);
        if (res) {
          this.toastr.success(res.message || 'News Deleted successfully.');
          this.getAdvList();
        }
        this.error = false;
      }, (err: any) => {
          this.loaderService.display(false);
          if (err && err.error && err.error.message) {
            this.toastr.error(err.error.message || 'There was an error');
          }
      });
  }

}
