<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Player_Share_History extends Model
{
    //
    protected $table = 'game.player_share_history';

    protected $primaryKey = 'player_id';

    protected $fillable = ['player_id','prev_number_of_shares','share_added','percent_dividend','share_added','created_date','buy_rate','sell_rate'
	];

    public $timestamps = false;
}
