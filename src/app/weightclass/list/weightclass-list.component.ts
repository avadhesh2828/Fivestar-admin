import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';
import { range, dateFormatString, formatDate, formatDateTimeZone } from '../../services/utils.service';
import { WeightclassService } from '../../services/weightclass.service';
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
  selector: 'app-weightclass-list',
  templateUrl: './weightclass-list.component.html',
  styleUrls: ['./weightclass-list.component.scss']
})
export class WeightclassListComponent implements OnInit {

  public formatDateTimeZone = formatDateTimeZone;
  public params = { ...INITIAL_PARAMS };
  public weightclassList = [];
  public url = "";
  public totalEvent = 0;
  public totalPaginationShow = [];
  public totalPages = 0;
  public currency_code = '$';
  options: Options = {
    floor: 0,
    ceil: 10000
  };
  public currentWeightclass: any;
  public confirmbMessage = '';

  constructor(
    private weightclassService: WeightclassService,
    private toastr: ToastrService,
    private loaderService: LoaderService
     ) { }

  ngOnInit() {
    this.getAllWeightclass();
  }

  public getAllWeightclass() {
    this.loaderService.display(true);
    this.createUrl();
    this.weightclassService.getAllWeightclass(this.url).pipe(first())
      .subscribe((weightclass: any) => {
        this.weightclassList = weightclass.data.data;
        this.createPaginationItem(weightclass.data.total);
        this.loaderService.display(false);
      }, (err: any) => {
        this.weightclassList = [];
        this.toastr.error(err.error.global_error || 'There was an error.');
      });
  }

  createUrl() {
    this.url = "weightclass/list?";
    this.url += 'per_page=' + this.params.per_page + '&page=' + this.params.current_page + '&keyword=' + this.params.keyword;
  }

  searchFilter(isReset = false) {
    if (isReset) {
      this.params.keyword = "";
    }
    this.getAllWeightclass();
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
    this.getAllWeightclass();
  }

  public nextOrPreviousPage(deviation: number) {
    this.params.current_page = this.params.current_page + deviation;
    localStorage.setItem('contestFilters', JSON.stringify(this.params));
    this.getAllWeightclass();
  }

  public formatDate(date) {
    return date.replace(' ', 'T') + 'Z';
  }
  deleteConfirm(weightclass) {
    this.currentWeightclass = weightclass;
    console.log(this.currentWeightclass);
    this.confirmbMessage = 'Are you sure you want to Delete Weight Class "' + this.currentWeightclass.weight_class_name +'" ?';
    $('#deleteConfirm').modal('show');
  }
  delete(){
    this.weightclassService.delete({'weight_class_id':this.currentWeightclass.weight_class_id})
      .subscribe((res: any) => {
        this.loaderService.display(false);
        if (res) {
          this.toastr.success(res.message || 'Weight Class Deleted successfully.');
          this.getAllWeightclass();
        }
        //this.error = false;
      }, (err: any) => {
          this.loaderService.display(false);
          if (err && err.error && err.error.message) {
            this.toastr.error(err.error.message || 'There was an error');
          }
      });
  }

  public onFeeSubmit(weightclass)
  {
    if(!weightclass.weight_class_name){
      this.toastr.error("weightclass name must not be null");
      return
    }
    if((weightclass.min_weight + "").length != 4){
      this.toastr.error("Min weight should except only 4 digits");
      return
    }
    if((weightclass.max_weight+ "").length != 4){
      this.toastr.error("Max weight should except only 4 digits");
      return
    }
    this.loaderService.display(true);
    weightclass.isEditable = false;
     this.weightclassService.updateWeightclass({ weight_class_id: weightclass.weight_class_id, weight_class_name: weightclass.weight_class_name, min_weight:weightclass.min_weight, max_weight:weightclass.max_weight})
       .subscribe((res: any) => {
      this.loaderService.display(false);
      if (res && res.message) {
        this.getAllWeightclass();
        this.toastr.success(res.message || 'weightclass name updated successfully.');
        
      }

    }, (err: any) => {
      this.loaderService.display(false);
      if (err && err.error && err.error.message) {
        this.toastr.error(err.error.message || 'There was an error');
      }
    });    
  }
}


