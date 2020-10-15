import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { NotificationService } from '../../services/notification.service';
import { formatDate,range } from '../../services/utils.service';
import { AgentService } from '../../services/agent.service';
import { LoaderService } from '../../shared/loader/loader.service';
import { Constants } from '../../constants';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

const INITIAL_PARAMS = {
  items_perpage: 20,
  current_page: 1,
};

@Component({
  selector: 'app-agent-notification',
  templateUrl: './agent-notify.component.html',
  styleUrls: ['./agent-notify.component.scss', '../../shared/scss/shared.scss']
})
export class AgentNotificationComponent implements OnInit {
  public params: any = { ...INITIAL_PARAMS };
  public agentList = null;
  formatDateTime = formatDate;
  public totalUsers = 0;
  public totalPaginationShow = [];
  public totalPages = 0;
  public error = false;
  public currency_code = Constants.CURRENCY_CODE;
  public selectedUsers = {};
  public selectedUserIds = {};
  public notification: string;
  searchTextChanged: Subject<string> = new Subject<string>();

  constructor(
    private notificationService: NotificationService, private agentService: AgentService, private toastr: ToastrService,
    private loaderService: LoaderService
  ) { }

  ngOnInit() {
    this.getUsers();
    this.searchTextChanged.pipe(debounceTime(1000))
      .subscribe(model => this.getUsers());
  }

  search() {
    this.params.current_page = 1;
    this.searchTextChanged.next();
  }

  private getUsers() {
    this.agentService.getAgents({ ...this.params })
      .subscribe((response: any) => {
        if (response.data && response.data.result) {
          this.agentList = response.data.result;
          this.createPaginationItem(response.data.total);
        }
        this.error = false;
      }, () => {
        this.error = true;
      });
  }

  private createPaginationItem(totalUsers: number) {
    this.totalUsers = totalUsers;
    const maxPages: number = Math.ceil(totalUsers / this.params.items_perpage);
    const end = (this.params.current_page + 5) < maxPages ? this.params.current_page + 5 : maxPages;
    const start = (this.params.current_page - 5) > 1 ? this.params.current_page - 5 : 1;
    this.totalPages = maxPages;
    this.totalPaginationShow = range(end, start);
  }

  public paginateList(newPage: number) {
    if (this.params.current_page === newPage) { return false; }
    this.params.current_page = newPage;
    this.getUsers();
  }

  public nextOrPreviousPage(deviation: number) {
    this.params.current_page = this.params.current_page + deviation;
    this.getUsers();
  }

   public searchFilter(type?: string) {
    // localStorage.setItem('adminuserFilters', JSON.stringify(this.params));
    if (type === 'reset') {
      this.params = { ...INITIAL_PARAMS };
      // localStorage.removeItem('adminuserFilters');
    }
    this.params.current_page = 1;
    this.getUsers();
  }

  public onSubmit() {
    if (!this.notification) {
      return this.toastr.error('Please enter a notification message');
    }
    const receiver_user_ids = [];
    Object.keys(this.selectedUserIds).forEach((key) => {
      this.selectedUserIds[key].forEach((userId: any) => receiver_user_ids.push(userId));
    });
    if (!receiver_user_ids.length) {
      return this.toastr.error('Please select at least one user');
    }
    this.loaderService.display(true);
    this.notificationService.createNotifications({ receiver_user_ids, notification_content: this.notification })
      .subscribe(() => {
        this.loaderService.display(false);
        this.handleReset();
        this.toastr.success('Notifications created successfully');
      }, (error) => {
        this.loaderService.display(false);
        this.toastr.error((error.error && error.error.message) || error.message ||
          'There was an error in creating notifications. Please try again.');
      });
  }

  public selectUsers(userObject: any, event: any) {
    // debugger;
    if (userObject === 'all') {
      if (event.target.checked) {
        this.selectedUsers[this.params.current_page] = [];
        this.selectedUserIds[this.params.current_page] = [];
        this.agentList.forEach((agent: any) => {
          this.selectedUsers[this.params.current_page].push(agent.email);
          this.selectedUserIds[this.params.current_page].push(agent.agent_id);
        });
      } else {
        delete this.selectedUsers[this.params.current_page];
        delete this.selectedUserIds[this.params.current_page];
      }
    } else {
      if (event.target.checked) {
        this.selectedUsers[this.params.current_page] = this.selectedUsers[this.params.current_page] || [];
        this.selectedUserIds[this.params.current_page] = this.selectedUserIds[this.params.current_page] || [];
        this.selectedUsers[this.params.current_page].push(userObject.email);
        this.selectedUserIds[this.params.current_page].push(userObject.agent_id);
      } else {
        const userIndex = this.selectedUsers[this.params.current_page].indexOf(userObject.email);
        if (userIndex !== -1) {
          this.selectedUsers[this.params.current_page].splice(userIndex, 1);
          this.selectedUserIds[this.params.current_page].splice(userIndex, 1);
        }
      }
    }
  }

  public handleReset() {
    this.notification = '';
    this.selectedUsers = {};
    this.selectedUserIds = {};
  }
}
