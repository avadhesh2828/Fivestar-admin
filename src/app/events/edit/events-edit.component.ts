import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import * as moment from 'moment';
import { ContestService } from '../../services/contest.service';
import { EventService } from '../../services/event.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-events-edit',
  templateUrl: './events-edit.component.html',
  styleUrls: ['./events-edit.component.scss']
})
export class EventsEditComponent implements OnInit {

  public league: any = '';
  public gameStyle: any = '';
  public sizeType: any = '';
  public contestForm: FormGroup;
  public submitted: boolean;
  public formError: any = {};
  public formSubmitted: boolean;
  public promotion:[];
  public tournaments = [];
  public optMatches = [];
  public optMatchesDates = [];
  public minDate = new Date();
  public event;
  public eventDatetime;
  public tournamentsDetails:[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private contestService: ContestService,
    private eventService: EventService,
  ) { }

  ngOnInit() {
    this.initContestForm();
    this.getPromotion();
    this.getEventDetails();
  }
  initContestForm() {

    this.contestForm = this.formBuilder.group({
      eventName: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
      venueName: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
      venueAddress: ['', Validators.required],
      venueCity: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      venueZipcode: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
      eventDate: ['', Validators.required],
      promotionId: ['', [Validators.required]],
      optMatches:['',[]],
      optMatchesDates:[''],
    });
  }

  private getEventDetails() {
    const event_id = this.route.snapshot.paramMap.get('eventId');
    this.eventService.getEventDetails(event_id)
      .subscribe((event) => {
        if (event['data']) {
          this.event = event['data'];
          this.eventDatetime = new Date(this.event.event_datetime);
          this.tournamentsDetails = event['tournaments'];
          let allMatchId = [];
          //let allMatchDates = [];
          this.tournamentsDetails.map((value, key) => {
            allMatchId.push(value['match_id']);
            //allMatchDates.push(value.scheduled_date_time);
          });
          this.optMatches = allMatchId;
        }
      }, (err: object) => {
        //this.error = true;
      });
  }

  getPromotion(){
    this.eventService.getPromotion({}).pipe()
      .subscribe((pro: any) => {
        this.promotion = pro.data;
      }, (err: any) => {
        this.promotion = [];
        this.toastr.error(err.error.global_error || 'There was an error.');
      });
  }

  eventDateChange(){
    var eventDat = this.f.eventDate.value;
    //this.tournamentsDetails =[];
    if (eventDat != null){
      this.getTournaments();
    }
  }
  
  getTournaments() {
    var eventDate = this.formatDate(this.f.eventDate.value);
    this.eventService.getTournaments(eventDate).subscribe((res: any) => {
      this.tournaments = res.data;
    }, (err: any) => {
      this.tournaments = [];
      this.toastr.error(err.error.global_error || 'There was an error.');
    });
  }

  formatDate(date) {
    return moment(date).format('YYYY-MM-DD');
  }

  optAllMatches = function () {

    if (this.tournaments.length == this.optMatches.length) {
      this.optMatches = [];
    } else {
      let allMatchId = [];
      let allMatchDates = [];
      this.tournaments.map((value, key) => {
        allMatchId.push(value.match_id);
        allMatchDates.push(value.scheduled_date_time);
      });
      this.optMatches = allMatchId;
      this.optMatchesDates = allMatchDates;
    }
    this.f.optMatches.setValue(this.optMatches.join(','));
    this.f.optMatchesDates.setValue(this.optMatchesDates.join(','));
  }

  toggleOptMatch = function (match_id, match_start_date) {

    if (this.optMatches.indexOf(match_id) < 0) {
      this.optMatches.push(match_id);
      this.optMatchesDates.push(match_start_date);

    } else {
      var index = this.optMatches.indexOf(match_id);
      this.optMatches.splice(index, 1);

      var dateIndex = this.optMatchesDates.indexOf(match_start_date);
      this.optMatchesDates.splice(dateIndex, 1);
    }
    this.f.optMatches.setValue(this.optMatches.join(','));
    this.f.optMatchesDates.setValue(this.optMatchesDates.join(','));
  }
  


  onSubmit() {

    this.submitted = true;

    if (this.contestForm.invalid || Object.keys(this.formError).length > 0) {
        console.log(this.formError)
        console.log(this.contestForm)
      return;
    }
    else {

      // let dates = this.f.optMatchesDates.value.split(',').map(d => moment(d));
      // let startDate = moment.min(dates).format('YYYY-MM-DD HH:mm');
      // let endDate = moment.max(dates).format('YYYY-MM-DD HH:mm');

      const formInputData = {
        event_name: this.f.eventName.value,
        venue_name: this.f.venueName.value,
        venue_zipcode: this.f.venueZipcode.value,
        event_datetime: moment(this.f.eventDate.value).format('YYYY-MM-DD HH:mm'),
        opt_matches: this.f.optMatches.value,
        opt_matches_dates: this.f.optMatchesDates.value,
        promotion_id: this.f.promotionId.value,
        venue_city: this.f.venueCity.value,
        venue_address: this.f.venueAddress.value,
        event_id: this.event.event_id,
      };

      this.formSubmitted = true;
      this.eventService.updateEvent({ event_details: formInputData }).pipe()
        .subscribe((res: any) => {
          this.formSubmitted = false;
          if (res.response_code == 200) {
            this.toastr.success(res.message || 'Event Updated Successfully.');
            this.formError = '';
            this.router.navigate(['/events']);
          }
        }, err => {
          debugger
          let errorMessage = '';
          this.toastr.error(errorMessage || err.error.global_error || 'Some error occurred while creating new contest.');
          this.formSubmitted = false;
        });
    }
  }

  get f() {
    return this.contestForm.controls;
  }

}

