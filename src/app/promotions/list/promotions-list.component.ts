import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';
import { range, dateFormatString, formatDate, formatDateTimeZone } from '../../services/utils.service';
import { PromotionService } from '../../services/promotion.service';
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
  selector: 'app-promotions-list',
  templateUrl: './promotions-list.component.html',
  styleUrls: ['./promotions-list.component.scss']
})
export class PromotionsListComponent implements OnInit {

  public formatDateTimeZone = formatDateTimeZone;
  public params = { ...INITIAL_PARAMS };
  public promotionList = [];
  public url = "";
  public totalEvent = 0;
  public totalPaginationShow = [];
  public totalPages = 0;
  public currency_code = '$';
  options: Options = {
    floor: 0,
    ceil: 10000
  };
  public currentPromotion: any;
  public confirmbMessage = '';

  constructor(
    private promotionService: PromotionService,
    private toastr: ToastrService,
    private loaderService: LoaderService
     ) { }

  ngOnInit() {
    this.getPromotionList();
  }

  public getPromotionList() {
    this.loaderService.display(true);
    this.createUrl();
    this.promotionService.getAllPromotion(this.url).pipe(first())
      .subscribe((promotion: any) => {
        this.promotionList = promotion.data.data;
        this.createPaginationItem(promotion.data.total);
        this.loaderService.display(false);
      }, (err: any) => {
        this.promotionList = [];
        this.toastr.error(err.error.global_error || 'There was an error.');
      });
  }

  createUrl() {
    this.url = "promotion-list?";
    this.url += 'per_page=' + this.params.per_page + '&page=' + this.params.current_page + '&keyword=' + this.params.keyword;
  }

  searchFilter(isReset = false) {
    if (isReset) {
      this.params.keyword = "";
    }
    this.getPromotionList();
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
    this.getPromotionList();
  }

  public nextOrPreviousPage(deviation: number) {
    this.params.current_page = this.params.current_page + deviation;
    localStorage.setItem('contestFilters', JSON.stringify(this.params));
    this.getPromotionList();
  }

  public formatDate(date) {
    return date.replace(' ', 'T') + 'Z';
  }
  deleteConfirm(promotion) {
    //console.log(news);
    this.currentPromotion = promotion;
    this.confirmbMessage = 'Are you sure you want to Delete Promotion "' + this.currentPromotion.name +'" ?';
    //console.log(event);
    $('#deleteConfirm').modal('show');
  }
  delete(){
    this.promotionService.delete({'promotion_id':this.currentPromotion.id})
      .subscribe((res: any) => {
        this.loaderService.display(false);
        if (res) {
          this.toastr.success(res.message || 'Promotion Deleted successfully.');
          this.getPromotionList();
        }
        //this.error = false;
      }, (err: any) => {
          this.loaderService.display(false);
          if (err && err.error && err.error.message) {
            this.toastr.error(err.error.message || 'There was an error');
          }
      });
  }

  public onFeeSubmit(promotion)
  {
    if(!promotion.name){
      this.toastr.error("Promotion name must not be null");
      return
    }
    this.loaderService.display(true);
    promotion.isEditable = false;
     this.promotionService.updatePromotion({ id: promotion.id, name: promotion.name})
       .subscribe((res: any) => {
      this.loaderService.display(false);
      if (res && res.message) {
        this.getPromotionList();
        this.toastr.success(res.message || 'Promotion name updated successfully.');
        
      }

    }, (err: any) => {
      this.loaderService.display(false);
      if (err && err.error && err.error.message) {
        this.toastr.error(err.error.message || 'There was an error');
      }
    });    
  }
}

