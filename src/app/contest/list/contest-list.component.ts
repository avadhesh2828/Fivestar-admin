import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { LoaderService } from '../../shared/loader/loader.service';
import { first } from 'rxjs/operators';
import { range, dateFormatString, formatDate, formatDateTimeZone } from '../../services/utils.service';
import { ContestService } from '../../services/contest.service';
import { Constants } from '../../constants';
import { Options, LabelType } from 'ng5-slider';

const INITIAL_PARAMS = {
  per_page: 20,
  current_page: 1,
  payment_type: '',
  status: '',
  dates: [],
  keyword: '',
  entry_fee: '',
  order_by: '',
  sort_order: '',
  size: '',
  min_entry_fee: 0,
  max_entry_fee: 10000,
};
@Component({
  selector: 'app-contest-list',
  templateUrl: './contest-list.component.html',
  styleUrls: ['./contest-list.component.scss']
})

export class ContestListComponent implements OnInit {
  public formatDateTimeZone = formatDateTimeZone;
  public params = { ...INITIAL_PARAMS };
  public contestList = [];
  public url = "";
  public totalContest = 0;
  public totalPaginationShow = [];
  public totalPages = 0;
  public currency_code = '$';
  public contestStatus = { 1: 'Upcoming', 2: 'Live', 3: 'Cancelled', 4: 'Completed' };
  options: Options = {
    floor: 0,
    ceil: 10000
  };
  public currentContest;
  public confirmbMessage = '';

  constructor(
    private contestService: ContestService,
    private toastr: ToastrService,
    private loaderService: LoaderService) { }

  ngOnInit() {
    this.getContestList();
  }

  public getContestList() {
    this.loaderService.display(true);
    this.createUrl();
    this.contestService.getContests(this.url).pipe(first())
      .subscribe((contests: any) => {
        this.contestList = contests.data.data;
        this.createPaginationItem(contests.data.total);
        this.loaderService.display(false);
      }, (err: any) => {
        this.contestList = [];
        this.toastr.error(err.error.global_error || 'There was an error.');
      });
  }

  createUrl() {
    this.url = "contest/list?";
    this.url += 'perPage=' + this.params.per_page + '&page=' + this.params.current_page + '&status=' + this.params.status + '&max_entry_fee=' + this.params.max_entry_fee + '&min_entry_fee=' + this.params.min_entry_fee + '&keyword=' + this.params.keyword;
  }

  searchFilter(isReset = false) {
    if (isReset) {
      this.params.keyword = "";
      this.params.min_entry_fee = 0;
      this.params.max_entry_fee = 10000;
      this.params.status = '';
    }
    this.getContestList();
  }

  private createPaginationItem(totalContest: number) {
    this.totalContest = totalContest;
    const maxPages: number = Math.ceil(totalContest / this.params.per_page);
    const end = (this.params.current_page + 5) < maxPages ? this.params.current_page + 5 : maxPages;
    const start = (this.params.current_page - 5) > 1 ? this.params.current_page - 5 : 1;
    this.totalPages = maxPages;
    this.totalPaginationShow = range(end, start);
  }

  public paginateList(newPage: number) {
    if (this.params.current_page === newPage) { return false; }
    this.params.current_page = newPage;
    localStorage.setItem('contestFilters', JSON.stringify(this.params));
    this.getContestList();
  }

  public nextOrPreviousPage(deviation: number) {
    this.params.current_page = this.params.current_page + deviation;
    localStorage.setItem('contestFilters', JSON.stringify(this.params));
    this.getContestList();
  }

  public amountAscOrder(amount1, amount2) {
    return (+amount1.key > +amount2.key) ? 1 : -1;
  }

  public formatDate(date) {
    return date.replace(' ', 'T') + 'Z';
  }

  public totalAmountRaise(entry_fee, total_user_joined) {
    return entry_fee * total_user_joined;
  }

  deleteConfirm(contest) {
    this.currentContest = contest;
    this.confirmbMessage = 'Are you sure you want to Delete "' + this.currentContest.contest_name +'" ?';
    $('#deleteConfirm').modal('show');
  }

  delete(){
    this.contestService.deleteContest({'contest_uid':this.currentContest.contest_uid})
      .subscribe((res: any) => {
        //this.loaderService.display(false);
        if (res) {
          this.toastr.success(res.message || 'Contest Deleted successfully.');
          this.currentContest ='';
          this.getContestList();
        }
        //this.error = false;
      }, (err: any) => {
          //this.loaderService.display(false);
          if (err && err.error && err.error.message) {
            this.toastr.error(err.error.message || 'There was an error');
          }
      });
  }

  completeContestConfirm(contest){
    this.currentContest = contest;
    //this.completeContest();
    this.confirmbMessage = 'Are you sure you want to Complete "' + this.currentContest.contest_name +'" ?';
    $('#contestCompleteConfirm').modal('show');
  }
  completeContest(){
    this.contestService.completeContest({'contest_id':this.currentContest.contest_id})
      .subscribe((res: any) => {
        //this.loaderService.display(false);
        if (res) {
          this.toastr.success(res.message || 'Contests Completed, Winners Declared!');
          this.currentContest ='';
          this.getContestList();
        }
        //this.error = false;
      }, (err: any) => {
          //this.loaderService.display(false);
          if (err && err.error && err.error.message) {
            this.toastr.error(err.error.message || 'There was an error');
          }
      });
  }
  cancelledContestConfirm(contest){
    this.currentContest = contest;
    //this.completeContest();
    this.confirmbMessage = 'Are you sure you want to Cancelled "' + this.currentContest.contest_name +'" ?';
    $('#cancelledContestConfirm').modal('show');
  }
  cancelledContest(){
    this.contestService.cancelledContest({'contest_id':this.currentContest.contest_id})
      .subscribe((res: any) => {
        //this.loaderService.display(false);
        if (res) {
          this.toastr.success(res.message || 'Contest has been cancelled!');
          this.currentContest ='';
          this.getContestList();
        }
        //this.error = false;
      }, (err: any) => {
          //this.loaderService.display(false);
          if (err && err.error && err.error.message) {
            this.toastr.error(err.error.message || 'There was an error');
          }
      });
  }
  predictionStatus(contest){
    this.currentContest = contest;
    let changeStatus = '';
    if(this.currentContest.prediction_status == 0) {
       changeStatus = 'disable prediction';
    }else{
       changeStatus = 'enable prediction';
    }
    this.confirmbMessage = 'Are you sure you want to  "'+ changeStatus + " " + this.currentContest.contest_name +'" ?';
    $('#predictionStatusConfirm').modal('show');
  }

  completePrediction(){
    this.contestService.completePrediction({'contest_id':this.currentContest.contest_id,'prediction':this.currentContest.prediction_status})
      .subscribe((res: any) => {
        if (res) {
          this.toastr.success(res.message || 'Contest prediction change!');
          this.currentContest ='';
          this.getContestList();
        }
        //this.error = false;
      }, (err: any) => {
          if (err && err.error && err.error.message) {
            this.toastr.error(err.error.message || 'There was an error');
          }
      });
  }
}
