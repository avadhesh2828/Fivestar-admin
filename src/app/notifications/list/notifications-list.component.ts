import { Component, OnInit } from '@angular/core';
import { LoaderService } from '../../shared/loader/loader.service';
import { NotificationService } from '../../services/notification.service';
import { range } from '../../services/utils.service';

const INITIAL_PARAMS = {
  itemsPerPage: 20,
  currentPage: 1,
};

@Component({
  selector: 'app-notifications-list',
  templateUrl: './notifications-list.component.html',
  styleUrls: ['./notifications-list.component.scss', '../../shared/scss/shared.scss']
})
export class NotificationListComponent implements OnInit {
  public params: any = { ...INITIAL_PARAMS };
  public notificationList = null;
  public totalNotifications = 0;
  public totalPaginationShow = [];
  public totalPages = 0;
  public error = false;

  constructor(
    private notificationService: NotificationService,
    private loaderService: LoaderService,
  ) { }

  ngOnInit() {
    this.getNotifications();
  }

  private getNotifications() {
    this.loaderService.display(true);
    this.notificationService.getNotifications({ ...this.params })
      .subscribe((response: any) => {
        if (response.data && response.data.Notifications) {

          this.notificationList = response.data.Notifications;
          this.createPaginationItem(response.data.total);
        }
        this.loaderService.display(false);
        this.error = false;
      }, () => {
        this.error = true;
      });
  }

  private createPaginationItem(totalNotifications: number) {
    this.totalNotifications = totalNotifications;
    const maxPages: number = Math.ceil(totalNotifications / this.params.itemsPerPage);
    const end = (this.params.currentPage + 5) < maxPages ? this.params.currentPage + 5 : maxPages;
    const start = (this.params.currentPage - 5) > 1 ? this.params.currentPage - 5 : 1;
    this.totalPages = maxPages;
    this.totalPaginationShow = range(end, start);
  }

  public paginateList(newPage: number) {
    if (this.params.currentPage === newPage) { return false; }
    this.params.currentPage = newPage;
    this.getNotifications();
  }

  public nextOrPreviousPage(deviation: number) {
    this.params.currentPage = this.params.currentPage + deviation;
    this.getNotifications();
  }

  public searchFilter(type?: string) {
    if (type === 'reset') {
      this.params = { ...INITIAL_PARAMS };
    }
    this.params.currentPage = 1;
    this.getNotifications();
  }
}
