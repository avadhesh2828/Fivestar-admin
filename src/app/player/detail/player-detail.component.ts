import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {range, formatDateTimeZone, dateFormatString } from '../../services/utils.service';
import { PlayerService } from '../../services/Player.service';
import { PLAYERS_STATUS} from '../constants';
import { Constants } from '../../constants';
import { LoaderService } from '../../shared/loader/loader.service';
import { environment } from '../../../environments/environment';


const INITIAL_PARAMS = {
  player_id:'',
};

@Component({
  selector: 'app-player-detail',
  templateUrl: './player-detail.component.html',
  styleUrls: ['./player-detail.component.scss']
})
export class PlayerDetailComponent implements OnInit {
   public params = localStorage.getItem('userplayerFilters')
    ? JSON.parse(localStorage.getItem('userplayerFilters'))
    : { ...INITIAL_PARAMS }
  public player = null;
  public PlayerUserPortolio: any = [];
  public PlayerUserWatchlisted:any = [];
  public error = false;
  public enableEdit = false;
  public username = '';
  public formatDateTimeZone = formatDateTimeZone;
  public dateFormatString = dateFormatString;
  public playerStatus = PLAYERS_STATUS;
  public currency_code = Constants.CURRENCY_CODE;
  imgURL: any;
  constructor(
    private playerService: PlayerService, private route: ActivatedRoute, private toastr: ToastrService,
    private loaderService: LoaderService) { }

  ngOnInit() {
    this.getPlayerDetails();
  }

  private getPlayerDetails() {
    
    this.loaderService.display(true);
     this.params.player_id = this.route.snapshot.paramMap.get('playerId');
    this.playerService.getPlayerDetails(this.params)
      .subscribe((player) => {
        this.loaderService.display(false);
        if (player['data']) {
          this.player = player['data']; 
          this.imgURL = environment.PLAYER_IMG_URL+'/'+this.player['player_image'];   
        }
      }, (err: object) => {
        this.loaderService.display(false);
        this.error = true;
      });
  }
}
