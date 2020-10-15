import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges
} from '@angular/core';

import { PlayerService } from '../../services/Player.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-edit-player',
  templateUrl: './edit-player.component.html',
  styleUrls: ['./edit-player.component.scss']
})
export class EditPlayerComponent  {
  @Input() player: any;
  @Output() editedStatus = new EventEmitter<any>();
  public playerStatus = {
    '0': 'Inactive',
    '1': 'Active',
  };
  public current_buy_rate = null;
  public current_sell_rate = null;
  public addBuyrate = null;
  public addSellrate =  null;
  public NoOfShare = null;
  public PercentageDividend = null;

  public error = {
    addBuyrate: '',
    addSellrate:'',
    NoOfShare:'',
    PercentageDividend:'',

  };

  constructor(private playerService: PlayerService, private toastr: ToastrService, ) { 
  }

  ngOnChanges(data) { 
        this.addBuyrate = '';
        this.addSellrate = '';
        this.NoOfShare = '';
        this.PercentageDividend = '';
      if (data.player.currentValue) {
        this.current_buy_rate = data.player.currentValue.buy_rate;
        this.current_sell_rate = data.player.currentValue.sell_rate;
      }
  } 

  public onSubmit(data) {
    this.playerService.updatePlayer({ ...this.player, ...data }).subscribe(
      (response: any) => {

        if (response) {
          this.toastr.success(response.message);
        }
        this.player.buy_rate = data.buy_rate;
        this.player.sell_rate = data.sell_rate;
        this.player.no_of_share = data.no_of_share;

      this.editedStatus.emit({ success: true, update_player_detail: data });
        $('#editModal').modal('hide');
      },
      // (error: any) => {
      //     if (error && error.error && error.error.message) {
      //       this.toastr.error(error.error.message || 'There was an error');
      //       $('#editModal').modal('hide');
      //     }

      (error: any) => {
        if (error && error.error && error.error.message) {
          this.toastr.error(error.error.message || 'There was an error');
          $('#editModal').modal('hide');
        }
          
        
      }
    );
  }
}
