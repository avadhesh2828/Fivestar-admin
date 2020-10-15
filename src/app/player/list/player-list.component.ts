import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { PlayerService } from '../../services/Player.service';
import { EventService } from '../../services/event.service';
import { range, dateFormatString, formatDateTimeZone } from '../../services/utils.service';
import { PLAYERS_STATUS} from '../constants';
import { Constants } from '../../constants';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { LoaderService } from '../../shared/loader/loader.service';

const INITIAL_PARAMS = {
  per_page: 20,
  current_page: 1,
  sort_field: 'name',
  sort_order: 'ASC',
  keyword: '',
  status: -1,
  promotion:""
};
@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss', '../../shared/scss/shared.scss']
})
export class PlayerListComponent implements OnInit, AfterViewInit {
  public params = localStorage.getItem('adminuserFilters')
    ? JSON.parse(localStorage.getItem('adminuserFilters'))
    : { ...INITIAL_PARAMS };
  public playerList = null;
  public totalPlayers = 0;
  public totalPaginationShow = [];
  public totalPages = 0;
  public playerStatus = PLAYERS_STATUS;
  public currency_code = Constants.CURRENCY_CODE;
  public error = false;
  public currentPlayer = null;
  public allTeams = [];
  public allPositions = [];
  public dateFormatString = dateFormatString;
  public formatDateTimeZone = formatDateTimeZone;
  public editPlayerId = 0;
  public url: string = 'player/get_all_players?';
  public promotion:[];
  searchTextChanged: Subject<string> = new Subject<string>();
  public currentPlayerData;
  public confirmbMessage;

  constructor(
    private playerService: PlayerService,
    private toastr: ToastrService,
    private loaderService: LoaderService,
    private eventService: EventService,
  ) { }

  ngOnInit() {
    this.getTeams();
    this.getAllpositions();
    this.getPromotion();
    //this.getPlayerList();
    this.searchTextChanged.pipe(debounceTime(1000))
      .subscribe(model => this.getPlayerList());
  }

  search() {
    this.params.current_page = 1;
    this.searchTextChanged.next();
  }

  private createUrl() {
    this.url = 'player/get_all_players?';
    this.url += 'per_page=' + this.params.per_page + '&page=' + this.params.current_page + '&status=' + this.params.status + '&keyword=' + this.params.keyword + '&promotion=' + this.params.promotion;
  }

  ngAfterViewInit() {
    const that = this;
    // Listen for bootstrap modal's hidden event to reset form
    $('#editModal').on('hidden.bs.modal', function () {
      that.currentPlayer = null;
      $(this).find('textarea').val('').end();
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

  public getPlayerList() {
    this.loaderService.display(true);
    this.createUrl();
    this.playerService.getAllPlayers(this.url)
      .subscribe((player: []) => {
        this.loaderService.display(false);
        // debugger;
        if (player['data'] && player['data'].data) {
          this.playerList = player['data'].data;
          this.createPaginationItem(player['data'].total);
        }
        this.error = false;
      }, (err: Error) => {
        this.loaderService.display(false);
        this.error = true;
      });
  }

  private getTeams() {
    this.playerService.getAllTeams({ 'league_id': this.params.league_id })
      .subscribe((response: any) => {
        if (response) {
          this.allTeams = response.data;
        }
        this.error = false;
      }, () => {
        this.error = true;
      });
  }

  private getAllpositions() {
    this.playerService.getAllPositions({ 'league_id': this.params.league_id })
      .subscribe((response: any) => {
        if (response) {
          
          this.allPositions = response.data;
          //this.params.position = this.allPositions['position_abbr'];
        }
        this.error = false;
      }, () => {
        this.error = true;
      });
    this.getPlayerList();
  }

  private createPaginationItem(totalUSer: number) {
    this.totalPlayers = totalUSer;
    const maxPages: number = Math.ceil(totalUSer / this.params.per_page);
    const end = (this.params.current_page + 5) < maxPages ? this.params.current_page + 5 : maxPages;
    const start = (this.params.current_page - 5) > 1 ? this.params.current_page - 5 : 1;
    this.totalPages = maxPages;
    this.totalPaginationShow = range(end, start);
  }

  public paginateList(newPage: number) {
    if (this.params.current_page === newPage) { return false; }
    this.params.current_page = newPage;
    localStorage.setItem('adminplayerFilters', JSON.stringify(this.params));
    this.getPlayerList();
  }

  public nextOrPreviousPage(deviation: number) {
    this.params.current_page = this.params.current_page + deviation;
    localStorage.setItem('adminplayerFilters', JSON.stringify(this.params));
    this.getPlayerList();
  }

  public searchFilter(type?: string) {
    // this.params.current_page = 1;
    localStorage.setItem('adminplayerFilters', JSON.stringify(this.params));
    if (type === 'reset') {
      this.params = { ...INITIAL_PARAMS };
      localStorage.removeItem('adminplayerFilters');
    }
    this.params.current_page = 1;
    this.getPlayerList();
  }

  public startEdit(player) {
    this.currentPlayer = player;

  }

  public onStatusEdit(editStatus: any) {
    if (editStatus.success) {
      this.getPlayerList();
      this.playerList[this.currentPlayer.playerIndex].status = this.currentPlayer.status;
    }
  }

  //update player status
   public updateStatus(status, player_unique_id) {
     status = status ? 1 : 0;
    this.playerService.updatePlayerStatus({ player_unique_id, status })
      .subscribe((response: any) => {
        if (response) {
          this.getPlayerList();
          this.toastr.success(response.message);
        }
      }, (error) => {
        this.toastr.error(error.error['message']);
      });

   }

  //edit and update player injury status
  setInjuryStatusEditable(player_unique_id: number) {
    this.editPlayerId = player_unique_id;
  }

  saveInjuryStatus(player: any) {
    if (player.player_unique_id) {
      this.playerService.updatePlayer(player)
        .subscribe((response: any) => {
          if (response && response.data) {
            this.toastr.success(response.message);
          }
        }, (error: any) => {
          this.toastr.error(error.error['message']);
        });

    }
    this.editPlayerId = 0;
  }

  deleteConfirm(player) {
    this.currentPlayerData = player;
    this.confirmbMessage = 'Are you sure you want to Delete "' + this.currentPlayerData.first_name +'" ?';
    $('#deleteConfirm').modal('show');
  }

  delete(){
    this.playerService.deletePlayer({'player_id':this.currentPlayerData.player_id})
      .subscribe((res: any) => {
        this.loaderService.display(false);
        if (res) {
          this.toastr.success(res.message || 'Player Deleted successfully.');
          this.getPlayerList();
        }
        //this.error = false;
      }, (err: any) => {
          this.loaderService.display(false);
          if (err && err.error && err.error.message) {
            this.toastr.error(err.error.message || 'There was an error');
          }
      });
  }

}
