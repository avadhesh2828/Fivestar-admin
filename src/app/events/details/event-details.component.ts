import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { formatDateTimeZone, dateFormatString } from '../../services/utils.service';
import { EventService } from '../../services/event.service';
//import { USER_STATUS, KYC_STATUS } from '../constants';
import { Constants } from '../../constants';
import { LoaderService } from '../../shared/loader/loader.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss']
})
export class EventDetailsComponent implements OnInit {

  public event = null;
  public error = false;
  public tournaments = [];
  public formatDateTimeZone = formatDateTimeZone;
  public dateFormatString = dateFormatString;
  public currency_code = Constants.CURRENCY_CODE;
  imgURL: any;


  constructor(
    private eventService: EventService, private route: ActivatedRoute, private toastr: ToastrService,
    private loaderService: LoaderService) { }

  ngOnInit() {
    this.getEventDetails();
  }

  private getEventDetails() {
    this.loaderService.display(true);
    const event_id = this.route.snapshot.paramMap.get('eventId');
    this.eventService.getEventDetails(event_id)
      .subscribe((event) => {
        this.loaderService.display(false);
        if (event['data']) {
          this.event = event['data'];
          this.tournaments = event['tournaments'];
        }
      }, (err: object) => {
        this.loaderService.display(false);
        this.error = true;
      });
  }

  public formatDate(date) {
    if (date[date.length - 3] === '+') {
      return new Date(date + ':00');
    }
    return new Date(date);
  }


}
