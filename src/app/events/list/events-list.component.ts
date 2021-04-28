import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';
import { range, dateFormatString, formatDate, formatDateTimeZone } from '../../services/utils.service';
import { EventService } from '../../services/event.service';
import { Constants } from '../../constants';
import { LoaderService } from '../../shared/loader/loader.service';
import { Options, LabelType } from 'ng5-slider';

const INITIAL_PARAMS = {
  per_page: 20,
  current_page: 1,
  payment_type: '',
  //dates: [],
  keyword: '',
  order_by: '',
  sort_order: '',
};
@Component({
  selector: 'app-events-list',
  templateUrl: './events-list.component.html',
  styleUrls: ['./events-list.component.scss']
})
export class EventsListComponent implements OnInit {

  public formatDateTimeZone = formatDateTimeZone;
  public params = { ...INITIAL_PARAMS };
  public eventList = [];
  public url = "";
  public totalEvent = 0;
  public totalPaginationShow = [];
  public totalPages = 0;
  public currency_code = '$';
  options: Options = {
    floor: 0,
    ceil: 10000
  };
  public currentEvent: any;
  public confirmbMessage = '';

  constructor(
    private eventService: EventService,
    private toastr: ToastrService,
    private loaderService: LoaderService
     ) { }

  ngOnInit() {
    this.getEventList();
  }

  public getEventList() {
    this.loaderService.display(true);
    this.createUrl();
    this.eventService.getAllEvents(this.url).pipe(first())
      .subscribe((event: any) => {
        this.eventList = event.data.data;
        this.createPaginationItem(event.data.total);
        this.loaderService.display(false);
      }, (err: any) => {
        this.eventList = [];
        this.toastr.error(err.error.global_error || 'There was an error.');
      });
  }

  createUrl() {
    this.url = "events/list?";
    this.url += 'per_page=' + this.params.per_page + '&page=' + this.params.current_page + '&keyword=' + this.params.keyword;
  }

  searchFilter(isReset = false) {
    if (isReset) {
      this.params.keyword = "";
    }
    this.getEventList();
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
    this.getEventList();
  }

  public nextOrPreviousPage(deviation: number) {
    this.params.current_page = this.params.current_page + deviation;
    localStorage.setItem('contestFilters', JSON.stringify(this.params));
    this.getEventList();
  }

  public formatDate(date) {
    return date.replace(' ', 'T') + 'Z';
  }
  deleteConfirm(event) {
    this.currentEvent = event;
    this.confirmbMessage = 'Are you sure you want to Delete "' + this.currentEvent.event_name +'" ?';
    $('#deleteConfirm').modal('show');
  }
  delete(){
    this.eventService.deleteEvent({'event_id':this.currentEvent.event_id})
      .subscribe((res: any) => {
        this.loaderService.display(false);
        if (res) {
          this.toastr.success(res.message || 'Event Deleted successfully.');
          this.getEventList();
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
