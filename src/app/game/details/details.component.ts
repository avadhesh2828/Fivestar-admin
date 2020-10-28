import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { formatDateTimeZone, dateFormatString } from '../../services/utils.service';
import { GamesService } from '../../services/games.service';
import { STATUS } from '../constants';
import { Constants } from '../../constants';
import { LoaderService } from '../../shared/loader/loader.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {

  public game = null;
  public error = false;
  // public enableEdit = false;
  // public username = '';
  public formatDateTimeZone = formatDateTimeZone;
  public dateFormatString = dateFormatString;
  public gameStatus = STATUS;
  // public oldUserName = '';
  // public currency_code = Constants.CURRENCY_CODE;
  imgURL: any;

  constructor(
    private gamesService: GamesService, 
    private route: ActivatedRoute, 
    private toastr: ToastrService,
    private loaderService: LoaderService
  ) { }

  ngOnInit() {
    this.getGameDetail();
  }

  private getGameDetail() {
    this.loaderService.display(true);
    const gameId = this.route.snapshot.paramMap.get('gameId');
    this.gamesService.getGameDetails(gameId)
      .subscribe((game) => {
        this.loaderService.display(false);
        if (game['data']) {
          this.game = game['data'];
          // this.oldUserName = this.user['user_name'];
          // this.imgURL = environment.USER_IMG_URL+'/'+this.user['image'];  
        }
      }, (err: object) => {
        this.loaderService.display(false);
        this.error = true;
      });
  }

}