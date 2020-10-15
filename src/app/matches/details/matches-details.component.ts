import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { formatDateTimeZone, dateFormatString, getJsonValueOfKey, FeedColumnName } from '../../services/utils.service';
import { MatchesService } from '../../services/matches.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-matches-details',
  templateUrl: './matches-details.component.html',
  styleUrls: ['./matches-details.component.scss', '../../shared/scss/shared.scss']
})
export class MatchesDetailsComponent implements OnInit {
  public playerData = null;
  public matchInfo = null;
  public error = false;
  public positionTitle: '';
  public matchTitle = {};
  public formatDateTimeZone = formatDateTimeZone;
  public dateFormatString = dateFormatString;
  public getJsonValueOfKey = getJsonValueOfKey;
  public FeedColumnName = FeedColumnName;
  public fighterStatus = { 1: 'Favourite', 2: 'Underdog' };
  imgURL:any;

  constructor(private matchesService: MatchesService, private route: ActivatedRoute) { }

  ngOnInit() {
    // this.getPlayerlist();
    this.getMatchDetail();
    this.imgURL = environment.PLAYER_IMG_URL;  
  }

  assignType(player) {
    return this.positionTitle = player.position_type;
  }

  // private getPlayerlist() {
  //   const match_unique_id = this.route.snapshot.paramMap.get('matchId');
  //   this.feedService.getPlayerXI({ match_unique_id })
  //     .subscribe((response: any) => {
  //       if (response.data) {
  //         this.playerData = response.data;
  //       }
  //       // this.getH2H();
  //       this.error = false;
  //     }, () => {
  //       this.error = true;
  //     });
  // }
  private getMatchDetail() {
    const match_unique_id = this.route.snapshot.paramMap.get('matchId');
    this.matchesService.getMatchDetail({ match_unique_id })
      .subscribe((response: any) => {
        if (response.data) {
          this.matchInfo = response.data;
          if (this.matchInfo.favourite_fighter_player_image) {
            this.matchTitle['favourite_player_image'] = environment.PLAYER_IMG_URL+'/'+this.matchInfo.favourite_fighter_player_image;
            //delete this.matchInfo.home_team_logo;
          }

          if (this.matchInfo.underdog_fighter_player_image) {
            this.matchTitle['underdog_player_image'] = environment.PLAYER_IMG_URL+'/'+this.matchInfo.underdog_fighter_player_image;
            //delete this.matchInfo.away_team_logo;
          }
        }
        // this.getH2H();
        this.error = false;
      }, () => {
        this.error = true;
      });
  }

  stopSorting() {
    return 0;
  }



}
